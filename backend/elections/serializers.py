from rest_framework import serializers
from django.utils import timezone
from .models import Election, Position, Candidate, Vote
from dasa_users.serializers import UserSerializer


class ElectionSerializer(serializers.ModelSerializer):
    """Serializer for the Election model"""
    is_open = serializers.ReadOnlyField()
    status = serializers.SerializerMethodField()
    should_display = serializers.SerializerMethodField()

    class Meta:
        model = Election
        fields = ['id', 'title', 'start_date', 'end_date', 'is_active', 'is_open', 'is_published', 'status', 'should_display']
        read_only_fields = ['id', 'is_open', 'status', 'should_display']

    def get_status(self, obj):
        """
        Calculate election status based on time and is_active flag.

        Rules:
        1. If time > end_date: CLOSED (regardless of is_active)
        2. If time < start_date AND is_active=True: UPCOMING
        3. If time is within period AND is_active=False: PAUSED
        4. If time is within period AND is_active=True: LIVE
        5. If time is NOT within period AND is_active=False: Don't display (handled by should_display)
        """
        now = timezone.now()

        # Check 1: Past end date - always CLOSED
        if now > obj.end_date:
            return 'CLOSED'

        # Check 2: Before start date
        if now < obj.start_date:
            if obj.is_active:
                return 'UPCOMING'
            else:
                # Not active and not started - don't show (but return status anyway)
                return 'PAUSED'

        # Check 3: Within election period (now >= start_date and now <= end_date)
        if obj.is_active:
            return 'LIVE'
        else:
            return 'PAUSED'

    def get_should_display(self, obj):
        """
        Determine if election should be displayed on public UI.

        Display rules:
        1. Don't show: is_active=False AND (time before start OR time after end)
        2. Show: is_active=False AND time within election period (PAUSED)
        3. Show: is_active=True AND time before start (UPCOMING)
        4. Show: is_active=True AND time within period (LIVE)
        5. Show: is_active=True AND time after end (CLOSED)
        """
        now = timezone.now()

        # If not active and election hasn't started OR has ended, don't display
        if not obj.is_active:
            if now < obj.start_date or now > obj.end_date:
                return False
            # If within period and not active, show as PAUSED
            return True

        # If active, always display (UPCOMING, LIVE, or CLOSED based on time)
        return True


class PositionSerializer(serializers.ModelSerializer):
    """Serializer for the Position model"""
    election_title = serializers.CharField(source='election.title', read_only=True)

    class Meta:
        model = Position
        fields = ['id', 'election', 'election_title', 'name', 'rank', 'max_votes_per_user']
        read_only_fields = ['id']


class CandidateSerializer(serializers.ModelSerializer):
    """Serializer for the Candidate model"""
    user_details = UserSerializer(source='user', read_only=True)
    position_name = serializers.CharField(source='position.name', read_only=True)
    election_title = serializers.CharField(source='position.election.title', read_only=True)
    total_votes = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Candidate
        fields = [
            'id',
            'position',
            'position_name',
            'election_title',
            'user',
            'user_details',
            'manifesto',
            'photo',
            'total_votes'
        ]
        read_only_fields = ['id', 'total_votes']

    def to_representation(self, instance):
        """
        Override to_representation to strictly hide vote counts.
        Logic:
        1. If user is admin (is_staff), show votes.
        2. If election is published (is_published), show votes.
        3. Otherwise, return None or 0.
        """
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Default to hiding votes
        show_votes = False
        
        if request and request.user.is_staff:
            show_votes = True
        elif instance.position.election.is_published:
            show_votes = True
            
        if not show_votes:
            # Hide the vote count
            data.pop('total_votes', None)
            
        return data


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for the Vote model"""
    voter_username = serializers.CharField(source='voter.username', read_only=True)
    position_name = serializers.CharField(source='position.name', read_only=True)
    candidate_name = serializers.CharField(source='candidate.user.get_full_name', read_only=True)

    class Meta:
        model = Vote
        fields = [
            'id',
            'voter',
            'voter_username',
            'position',
            'position_name',
            'candidate',
            'candidate_name',
            'timestamp'
        ]
        read_only_fields = ['id', 'voter', 'timestamp']

    def validate(self, data):
        """
        Validate that:
        1. The candidate belongs to the position being voted for
        2. The election is currently open
        3. The user hasn't already voted for this position (handled by unique_together in model)
        """
        candidate = data.get('candidate')
        position = data.get('position')

        # Check if candidate belongs to position
        if candidate.position != position:
            raise serializers.ValidationError(
                "The selected candidate does not belong to this position."
            )

        # Check if election is open
        if not position.election.is_open:
            raise serializers.ValidationError(
                "This election is not currently open for voting."
            )

        return data
