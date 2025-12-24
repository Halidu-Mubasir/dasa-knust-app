from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Profile, SystemConfig

# Domain whitelist configuration
# To change the allowed domain, update this constant
# Example: For testing, you might use '@example.com'
ALLOWED_STUDENT_DOMAIN = '@st.knust.edu.gh'


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for the Profile model"""
    class Meta:
        model = Profile
        fields = [
            'id',
            'student_id',
            'other_names',
            'gender',
            'college',
            'program_of_study',
            'hall_of_residence',
            'year_group',
            'hometown',
            'profile_picture'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'student_id': {'required': False},
            'other_names': {'required': False},
            'gender': {'required': False},
            'college': {'required': False},
            'program_of_study': {'required': False},
            'hall_of_residence': {'required': False},
            'year_group': {'required': False},
            'hometown': {'required': False},
            'profile_picture': {'required': False},
        }


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model with nested profile data"""
    profile = ProfileSerializer(read_only=True)
    
    # Flat profile fields for updates
    other_names = serializers.CharField(source='profile.other_names', required=False)
    student_id = serializers.CharField(source='profile.student_id', required=False)
    gender = serializers.CharField(source='profile.gender', required=False)
    college = serializers.CharField(source='profile.college', required=False)
    program_of_study = serializers.CharField(source='profile.program_of_study', required=False)
    hall_of_residence = serializers.CharField(source='profile.hall_of_residence', required=False)
    year_group = serializers.CharField(source='profile.year_group', required=False)
    hometown = serializers.CharField(source='profile.hometown', required=False)
    profile_picture = serializers.ImageField(source='profile.profile_picture', required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'is_student',
            'is_alumni',
            'profile',
            # Add flat fields to Meta.fields implicitly or explicitly?
            # If using source='profile.x', they are included.
            'other_names', 'student_id', 'gender', 'college', 'program_of_study',
            'hall_of_residence', 'year_group', 'hometown', 'profile_picture'
        ]
        read_only_fields = ['id', 'username', 'email']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """Override create to hash password properly"""
        password = validated_data.pop('password', None)
        # Pop profile data if present (caught by source fields?)
        # When using source='profile.field', DRF's ModelSerializer.create handles nested creates IF the relation is writable.
        # But here 'profile' is a OneToOne reverse relation?
        # To be safe, let's extract them. 
        # Actually, for create/update with source on nested fields requires special handling or `writable nested serializers`.
        # The prompt asks to "Override the update method".
        # I'll stick to manual handling to be safe and clearer.
        
        # We need to clean up validated_data before User creation because User model doesn't have these fields.
        profile_data = {}
        for field in ['other_names', 'student_id', 'gender', 'college', 'program_of_study', 'hall_of_residence', 'year_group', 'hometown', 'profile_picture']:
            if 'profile' in validated_data and field in validated_data['profile']:
                 profile_data[field] = validated_data['profile'][field]
            # If source is used, validated_data might have nested structure 'profile': {'field': val}
        
        # Actually, simpler to not use `source` for write fields to avoid auto-nesting confusion if we override update.
        # But if I don't use source, they are write_only?
        # Let's use `write_only=True` without source for the input, and let `profile` field handle the read output.
        pass

        user = User(**validated_data) # This will fail if profile data is in validated_data
        # ...
        
    # Re-writing the class content to be simpler and strictly follow the "override update" instruction with flat fields.
    
    """Serializer for the User model with nested profile data"""
    profile = ProfileSerializer(read_only=True)
    
    # Explicit write-only fields for profile updates
    other_names = serializers.CharField(required=False, write_only=True)
    student_id = serializers.CharField(required=False, write_only=True)
    gender = serializers.CharField(required=False, write_only=True)
    college = serializers.CharField(required=False, write_only=True)
    program_of_study = serializers.CharField(required=False, write_only=True)
    hall_of_residence = serializers.CharField(required=False, write_only=True)
    year_group = serializers.CharField(required=False, write_only=True)
    hometown = serializers.CharField(required=False, write_only=True)
    profile_picture = serializers.ImageField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'is_student', 'is_alumni', 'is_staff', 'is_superuser',
            'is_active', 'date_joined', 'last_login', 'profile',
            'other_names', 'student_id', 'gender', 'college',
            'program_of_study', 'hall_of_residence', 'year_group',
            'hometown', 'profile_picture'
        ]
        read_only_fields = ['id', 'username', 'email', 'is_student', 'is_alumni', 'is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # Remove profile fields from validated_data before creating user
        profile_fields = ['other_names', 'student_id', 'gender', 'college', 'program_of_study', 'hall_of_residence', 'year_group', 'hometown', 'profile_picture']
        profile_data = {k: validated_data.pop(k) for k in profile_fields if k in validated_data}
        
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        
        # Update profile
        if profile_data and hasattr(user, 'profile'):
            for k, v in profile_data.items():
                setattr(user.profile, k, v)
            user.profile.save()
            
        return user

    def update(self, instance, validated_data):
        # Ensure profile exists before updating (Safety Net)
        if not hasattr(instance, 'profile'):
            Profile.objects.create(user=instance)

        # Extract profile fields
        profile_fields = ['other_names', 'student_id', 'gender', 'college', 'program_of_study', 'hall_of_residence', 'year_group', 'hometown', 'profile_picture']
        profile_updates = {}
        for field in profile_fields:
            if field in validated_data:
                profile_updates[field] = validated_data.pop(field)

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        if profile_updates and hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_updates.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    Accepts flat profile fields for easier frontend integration.
    """
    profile = ProfileSerializer(read_only=True)
    
    # Explicit write-only fields for profile updates
    other_names = serializers.CharField(required=False, write_only=True)
    student_id = serializers.CharField(required=False, write_only=True)
    gender = serializers.CharField(required=False, write_only=True)
    college = serializers.CharField(required=False, write_only=True)
    program_of_study = serializers.CharField(required=False, write_only=True)
    hall_of_residence = serializers.CharField(required=False, write_only=True)
    year_group = serializers.CharField(required=False, write_only=True)
    hometown = serializers.CharField(required=False, write_only=True)
    profile_picture = serializers.ImageField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'is_student', 'is_alumni', 'is_staff', 'is_superuser',
            'is_active', 'date_joined', 'last_login', 'profile',
            'other_names', 'student_id', 'gender', 'college',
            'program_of_study', 'hall_of_residence', 'year_group',
            'hometown', 'profile_picture'
        ]
        read_only_fields = ['id', 'username', 'email', 'is_student', 'is_alumni', 'is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
        }

    def update(self, instance, validated_data):
        # Ensure profile exists before updating (Safety Net)
        if not hasattr(instance, 'profile'):
            Profile.objects.create(user=instance)

        # Extract profile fields
        profile_fields = ['other_names', 'student_id', 'gender', 'college', 'program_of_study', 'hall_of_residence', 'year_group', 'hometown', 'profile_picture']
        profile_updates = {}
        for field in profile_fields:
            if field in validated_data:
                profile_updates[field] = validated_data.pop(field)

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        if profile_updates and hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_updates.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with KNUST student email domain validation.

    This serializer enforces strict email domain checking to ensure only
    KNUST students can register through the public API.

    Domain Restriction:
    - Only emails ending with ALLOWED_STUDENT_DOMAIN are accepted
    - To change the allowed domain, update the ALLOWED_STUDENT_DOMAIN constant
    - This restriction does NOT apply to Django admin or createsuperuser command

    Password Handling:
    - Requires password confirmation
    - Uses Django's password validation
    - Automatically hashes passwords using create_user()
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        """
        Validation Rule 1: Domain Check
        Ensure email ends with the allowed KNUST student domain.
        """
        if not value.lower().endswith(ALLOWED_STUDENT_DOMAIN):
            raise serializers.ValidationError(
                f"Registration is restricted to KNUST student emails ({ALLOWED_STUDENT_DOMAIN})."
            )

        # Validation Rule 2: Email Uniqueness
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )

        return value.lower()

    def validate(self, attrs):
        """
        Validation Rule 3: Password Confirmation
        Ensure password and password_confirm match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Password fields didn't match."
            })

        return attrs

    def create(self, validated_data):
        """
        Create user with properly hashed password.
        Removes password_confirm and uses create_user() for password hashing.
        Automatically sets is_student=True for registered students.
        """
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm')

        # Extract password
        password = validated_data.pop('password')

        # Create user with hashed password
        user = User.objects.create_user(
            password=password,
            is_student=True,  # All registered users are students
            is_alumni=False,
            **validated_data
        )

        return user


class AdminUserUpdateSerializer(UserUpdateSerializer):
    """
    Serializer for Admin to update user roles and status.
    Allows updating is_staff, is_superuser, is_active.
    """
    class Meta(UserUpdateSerializer.Meta):
        # Allow writing to permission fields
        read_only_fields = ['id', 'username', 'email']
        extra_kwargs = {
            'is_staff': {'read_only': False},
            'is_superuser': {'read_only': False},
            'is_active': {'read_only': False},
        }


class SystemConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for SystemConfig singleton model.
    Used for retrieving and updating global system settings.
    """
    class Meta:
        model = SystemConfig
        fields = [
            'id',
            'maintenance_mode',
            'allow_registration',
            'current_academic_year',
            'current_semester',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class AdminUserCreationSerializer(serializers.ModelSerializer):
    """
    Serializer for admin to create new users.
    Admin can create users without domain restrictions and set initial passwords.
    """
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone_number',
            'is_student',
            'is_alumni',
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'is_student': {'required': False},
            'is_alumni': {'required': False},
        }

    def validate_username(self, value):
        """Ensure username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        """
        Create user with properly hashed password.
        Admin can create users without KNUST domain restrictions.
        """
        password = validated_data.pop('password')

        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            password=password,
            **validated_data
        )

        # Create associated profile
        Profile.objects.create(user=user)

        return user
