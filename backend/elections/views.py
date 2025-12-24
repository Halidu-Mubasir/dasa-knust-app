from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.db.models import Count
from .models import Election, Position, Candidate, Vote
from .permissions import IsAdminOrReadOnly
from .serializers import (
    ElectionSerializer,
    PositionSerializer,
    CandidateSerializer,
    VoteSerializer
)


class ElectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Election model
    Admin users can manage elections, authenticated users can view

    Permissions:
    - Students can view elections (GET, HEAD, OPTIONS)
    - Only admins can create/update/delete elections (POST, PUT, PATCH, DELETE)
    """
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        """
        Admins see all elections.
        Students only see published elections.
        """
        if self.request.user.is_staff:
            return Election.objects.all()
        return Election.objects.filter(models.Q(is_published=True) | models.Q(is_active=True))

    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all currently active elections
        Accessible at: /api/elections/active/
        """
        active_elections = Election.objects.filter(is_active=True)
        serializer = self.get_serializer(active_elections, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish_results(self, request, pk=None):
        """
        Publish election results to all users.
        Only admins can perform this action.
        """
        election = self.get_object()
        election.is_published = True
        election.save()
        return Response({'status': 'results published', 'is_published': True})

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get comprehensive election statistics for admin dashboard.
        Returns vote counts, turnout, and results by position.
        Accessible at: /api/elections/{id}/stats/
        """
        from dasa_users.models import User

        election = self.get_object()

        # Get all positions for this election
        positions = Position.objects.filter(election=election).order_by('rank')

        # Total votes cast across all positions
        total_votes_cast = Vote.objects.filter(position__election=election).count()

        # Unique voters (distinct users who voted in any position)
        total_voters = Vote.objects.filter(position__election=election).values('voter').distinct().count()

        # Total registered users (students only)
        total_registered_users = User.objects.filter(is_student=True, is_active=True).count()

        # Turnout percentage
        turnout_percentage = (total_voters / total_registered_users * 100) if total_registered_users > 0 else 0

        # Results by position
        results_by_position = []
        for position in positions:
            # Get all candidates for this position with their vote counts
            candidates = Candidate.objects.filter(position=position).annotate(
                vote_count=Count('vote')
            ).order_by('-vote_count')

            candidate_results = []
            for candidate in candidates:
                candidate_results.append({
                    'candidate_id': candidate.id,
                    'candidate_name': f"{candidate.user.first_name} {candidate.user.last_name}",
                    'candidate_username': candidate.user.username,
                    'photo': request.build_absolute_uri(candidate.photo.url) if candidate.photo else None,
                    'vote_count': candidate.vote_count,
                })

            # Total votes for this position
            position_total_votes = sum(c['vote_count'] for c in candidate_results)

            results_by_position.append({
                'position_id': position.id,
                'position_name': position.name,
                'rank': position.rank,
                'total_votes': position_total_votes,
                'candidates': candidate_results,
            })

        return Response({
            'election_id': election.id,
            'election_title': election.title,
            'is_active': election.is_active,
            'is_published': election.is_published,
            'total_votes_cast': total_votes_cast,
            'total_voters': total_voters,
            'total_registered_users': total_registered_users,
            'turnout_percentage': round(turnout_percentage, 2),
            'results_by_position': results_by_position,
        })


class PositionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Position model
    Admin users can manage positions, authenticated users can view

    Permissions:
    - Students can view positions (GET, HEAD, OPTIONS)
    - Only admins can create/update/delete positions (POST, PUT, PATCH, DELETE)

    Filtering:
    - Supports filtering by election ID via query params: ?election=<id>
    """
    queryset = Position.objects.all().order_by('election', 'rank')
    serializer_class = PositionSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['election']

    def get_queryset(self):
        """
        Optionally filter positions by election ID from query params.
        This ensures strict isolation of election data.
        """
        queryset = super().get_queryset()
        election_id = self.request.query_params.get('election')
        if election_id:
            queryset = queryset.filter(election_id=election_id)
        return queryset


class CandidateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Candidate model
    Admin users can manage candidates, authenticated users can view

    Permissions:
    - Students can view candidates (GET, HEAD, OPTIONS)
    - Only admins can create/update/delete candidates (POST, PUT, PATCH, DELETE)

    Filtering:
    - Supports filtering by election ID via query params: ?election=<id>
    - Filters candidates whose position belongs to the specified election
    """
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['position__election']

    def get_queryset(self):
        """
        Annotate queryset with total_votes count for efficient retrieval.
        Optionally filter candidates by election ID to ensure strict isolation.
        This prevents N+1 query problems when displaying candidate vote counts.
        """
        queryset = Candidate.objects.annotate(
            total_votes=Count('vote')
        ).select_related('user', 'position', 'position__election')

        # Filter by election if provided in query params
        election_id = self.request.query_params.get('election')
        if election_id:
            queryset = queryset.filter(position__election_id=election_id)

        return queryset

    @action(detail=True, methods=['get'])
    def vote_count(self, request, pk=None):
        """
        Get vote count for a specific candidate
        Accessible at: /api/candidates/{id}/vote_count/
        """
        candidate = self.get_object()
        count = Vote.objects.filter(candidate=candidate).count()
        return Response({'candidate_id': candidate.id, 'vote_count': count})


class VoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Vote model
    Authenticated users can vote, admin can view all votes

    Permissions:
    - Only authenticated students can vote
    - Votes cannot be updated or deleted once cast (immutable)

    Allowed HTTP methods: GET, POST, HEAD only
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head']  # Restrict to safe methods + POST

    def get_queryset(self):
        """
        Regular users can only see their own votes
        Admin users can see all votes
        """
        if self.request.user.is_staff:
            return Vote.objects.all()
        return Vote.objects.filter(voter=self.request.user)

    def perform_create(self, serializer):
        """
        Override perform_create to enforce strict voting eligibility rules.

        Validates:
        1. Candidate belongs to the specified position (election scoping)
        2. No double voting - user hasn't already voted for this position
        3. Election is open and active
        4. Only active students can vote (not alumni)
        """
        user = self.request.user
        position = serializer.validated_data.get('position')
        candidate = serializer.validated_data.get('candidate')

        # Rule 0: Verify candidate belongs to this position (critical for election scoping)
        if candidate.position != position:
            raise serializers.ValidationError({
                'candidate': 'The selected candidate does not belong to this position. This vote is invalid.'
            })

        # Rule 1: Check for double voting
        if Vote.objects.filter(voter=user, position=position).exists():
            raise serializers.ValidationError({
                'position': 'You have already voted for this position.'
            })

        # Rule 2: Check if election is open and active
        election = position.election
        if not election.is_active:
            raise serializers.ValidationError({
                'election': 'This election is not currently active.'
            })

        if not election.is_open:
            raise serializers.ValidationError({
                'election': 'This election is not open for voting at this time.'
            })

        # Rule 3: Check if user is an active student (not alumni)
        if user.is_alumni or not user.is_student:
            raise serializers.ValidationError({
                'voter': 'Only active students are eligible to vote. Alumni records show you have graduated.'
            })

        # All validations passed, save the vote
        serializer.save(voter=user)

    @action(detail=False, methods=['get'])
    def my_votes(self, request):
        """
        Get all votes by the current user
        Accessible at: /api/votes/my_votes/
        """
        votes = Vote.objects.filter(voter=request.user)
        serializer = self.get_serializer(votes, many=True)
        return Response(serializer.data)
