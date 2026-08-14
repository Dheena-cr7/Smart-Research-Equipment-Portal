"""
Management command: seed_data
Usage: python manage.py seed_data

Seeds the database with realistic research equipment and demo users for OptimusPrime.
Safe to run multiple times — uses get_or_create to avoid duplicates.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Equipment

User = get_user_model()

EQUIPMENT_DATA = [
    {
        'name': 'FTIR Spectrometer',
        'lab': 'Advanced Materials Laboratory',
        'department': 'Chemical Engineering',
        'status': 'available',
        'requires_approval': True,
        'description': (
            'Fourier Transform Infrared Spectrometer for molecular fingerprinting and '
            'chemical composition analysis. Capable of identifying functional groups in '
            'organic and inorganic samples with high sensitivity across 400–4000 cm⁻¹.'
        ),
    },
    {
        'name': 'Field Emission Scanning Electron Microscope (FE-SEM)',
        'lab': 'Nano Characterization Facility',
        'department': 'Materials Science',
        'status': 'available',
        'requires_approval': True,
        'description': (
            'High-resolution FE-SEM capable of imaging nanoscale surface features at '
            'magnifications up to 300,000×. Equipped with EDS for elemental analysis. '
            'Suitable for metallic, ceramic, polymer, and biological specimens.'
        ),
    },
    {
        'name': 'INSTRON Universal Testing Machine',
        'lab': 'Mechanical Testing Laboratory',
        'department': 'Mechanical Engineering',
        'status': 'available',
        'requires_approval': False,
        'description': (
            '100 kN capacity Universal Testing Machine for tensile, compressive, '
            'flexural, and fatigue testing. Supports ASTM and ISO standard test '
            'configurations with automated data acquisition and reporting.'
        ),
    },
    {
        'name': 'GPU Workstation Cluster',
        'lab': 'High-Performance Computing Lab',
        'department': 'Computer Science & Engineering',
        'status': 'available',
        'requires_approval': False,
        'description': (
            'NVIDIA A100-equipped workstation cluster optimized for deep learning, '
            'parallel computation, and large-scale data processing. '
            'Supports CUDA, PyTorch, TensorFlow, and JAX environments.'
        ),
    },
    {
        'name': 'Digital Storage Oscilloscope (4-Channel)',
        'lab': 'Electronics & Communication Laboratory',
        'department': 'Electronics & Communication Engineering',
        'status': 'available',
        'requires_approval': False,
        'description': (
            'Keysight MSOX4154A mixed-signal oscilloscope with 1.5 GHz bandwidth '
            'and 5 GSa/s sampling rate. Ideal for signal integrity analysis, '
            'protocol decoding (I2C, SPI, UART), and embedded systems debugging.'
        ),
    },
    {
        'name': 'CNC Milling Machine (3-Axis)',
        'lab': 'Advanced Manufacturing Laboratory',
        'department': 'Mechanical Engineering',
        'status': 'booked',
        'requires_approval': True,
        'description': (
            'Haas VF-2 3-axis CNC Vertical Machining Center with 762mm × 406mm × 508mm '
            'travel. Supports complex part geometries in aluminium, steel, and polymer. '
            'Requires prior CAD/CAM file submission and safety induction.'
        ),
    },
    {
        'name': 'Industrial 3D Printer (FDM)',
        'lab': 'Rapid Prototyping Studio',
        'department': 'Mechanical Engineering',
        'status': 'available',
        'requires_approval': False,
        'description': (
            'Stratasys Fortus 450mc FDM 3D printer supporting engineering-grade '
            'thermoplastics including ABS, ASA, PC, ULTEM 9085. '
            'Build volume: 406mm × 355mm × 406mm. Used for functional prototyping '
            'and end-use part manufacturing.'
        ),
    },
    {
        'name': 'CO₂ Laser Cutting & Engraving System',
        'lab': 'Photonics & Fabrication Lab',
        'department': 'Electronics & Communication Engineering',
        'status': 'maintenance',
        'requires_approval': True,
        'description': (
            '150W CO₂ laser cutter with 1300mm × 900mm work area. Capable of cutting '
            'acrylic, wood, fabric, leather, and engraving on glass and anodized '
            'aluminium. Requires safety training and PPE before operation.'
        ),
    },
    {
        'name': 'Simultaneous Thermal Analyzer (STA)',
        'lab': 'Thermal Analysis Laboratory',
        'department': 'Chemical Engineering',
        'status': 'available',
        'requires_approval': True,
        'description': (
            'NETZSCH STA 449 F3 Jupiter combining TGA and DSC in a single measurement. '
            'Operating range: RT to 1600°C. Used for polymer degradation, phase '
            'transition, and oxidation stability studies under controlled atmospheres.'
        ),
    },
    {
        'name': 'X-Ray Diffractometer (XRD)',
        'lab': 'Crystal Structure Analysis Lab',
        'department': 'Materials Science',
        'status': 'available',
        'requires_approval': True,
        'description': (
            'Rigaku MiniFlex 600 powder X-Ray Diffractometer for crystal structure '
            'determination, phase identification, and crystallite size analysis using '
            'Cu Kα radiation. Suitable for minerals, alloys, ceramics, and '
            'pharmaceutical compounds.'
        ),
    },
    {
        'name': 'High-Speed Camera System',
        'lab': 'Fluid Dynamics & Combustion Laboratory',
        'department': 'Mechanical Engineering',
        'status': 'available',
        'requires_approval': False,
        'description': (
            'Photron FASTCAM SA-Z capable of up to 2.1 million fps at reduced '
            'resolution. Used for capturing transient phenomena in fluid dynamics, '
            'impact testing, combustion analysis, and vibration studies.'
        ),
    },
    {
        'name': 'Embedded Systems Development Workstation',
        'lab': 'IoT & Embedded Systems Lab',
        'department': 'Computer Science & Engineering',
        'status': 'available',
        'requires_approval': False,
        'description': (
            'Complete embedded systems workstation featuring ARM Cortex-M4/M7 '
            'development boards (STM32, ESP32), JTAG/SWD debuggers, logic analyzers, '
            'function generators, and protocol analyzers. Ideal for firmware '
            'development, IoT prototyping, and RTOS experiments.'
        ),
    },
]

DEMO_USERS = [
    {
        'username': 'student_demo',
        'email': 'student@skcet.ac.in',
        'password': 'Student@123',
        'role': 'student',
        'department': 'Computer Science & Engineering',
        'first_name': 'Alex',
        'last_name': 'Kumar',
    },
    {
        'username': 'faculty_demo',
        'email': 'faculty@skcet.ac.in',
        'password': 'Faculty@123',
        'role': 'faculty',
        'department': 'Materials Science',
        'first_name': 'Dr. Priya',
        'last_name': 'Sharma',
    },
    {
        'username': 'admin_demo',
        'email': 'admin@skcet.ac.in',
        'password': 'Admin@123',
        'role': 'admin',
        'department': 'Administration',
        'first_name': 'Prof. Rajan',
        'last_name': 'Nair',
        'is_staff': True,
    },
]


class Command(BaseCommand):
    help = 'Seed database with realistic research equipment and demo users for OptimusPrime'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\nOptimusPrime -- Seeding Database\n'))

        # Seed equipment
        self.stdout.write('Creating equipment records...')
        created_count = 0
        for item in EQUIPMENT_DATA:
            obj, created = Equipment.objects.get_or_create(
                name=item['name'],
                defaults=item,
            )
            if created:
                created_count += 1
                self.stdout.write(f'  [CREATED] {obj.name}')
            else:
                self.stdout.write(f'  [EXISTS]  {obj.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nEquipment: {created_count} created, '
                f'{len(EQUIPMENT_DATA) - created_count} already existed.'
            )
        )

        # Seed demo users
        self.stdout.write('\nCreating demo users...')
        from rest_framework.authtoken.models import Token

        for user_data in DEMO_USERS:
            is_staff = user_data.pop('is_staff', False)
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data,
            )
            if created:
                user.set_password(password)
                user.is_staff = is_staff
                user.save()
                Token.objects.get_or_create(user=user)
                self.stdout.write(
                    f'  [CREATED] {user.username} (role={user.role}, password={password})'
                )
            else:
                self.stdout.write(f'  [EXISTS]  {user.username}')

        self.stdout.write(self.style.SUCCESS('\nSeed complete! Demo credentials:'))
        self.stdout.write('  Student : student_demo / Student@123')
        self.stdout.write('  Faculty : faculty_demo / Faculty@123')
        self.stdout.write('  Admin   : admin_demo   / Admin@123')
        self.stdout.write('')
