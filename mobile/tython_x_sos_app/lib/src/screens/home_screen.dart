import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../core/contact.dart';
import '../core/platform_capabilities.dart';
import '../services/contact_store.dart';
import '../services/sos_dispatcher.dart';
import 'setup_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  final ContactStore _contactStore = ContactStore();

  late final PlatformCapabilities _capabilities;
  late final SosDispatcher _dispatcher;
  late final AnimationController _pulseController;

  List<EmergencyContact> _contacts = const <EmergencyContact>[];
  bool _isLoading = true;
  bool _isDispatching = false;

  @override
  void initState() {
    super.initState();
    final localeName = WidgetsBinding.instance.platformDispatcher.locale.toString();
    _capabilities = PlatformCapabilities.detect(localeName: localeName);
    _dispatcher = SosDispatcher(capabilities: _capabilities);
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 650),
    )..repeat(reverse: true);
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final contacts = await _contactStore.loadContacts();
    if (!mounted) {
      return;
    }

    setState(() {
      _contacts = contacts;
      _isLoading = false;
    });

    if (contacts.isEmpty) {
      _showSnack('Add at least one emergency contact.');
    }
  }

  Future<void> _openSetupScreen() async {
    final updatedContacts = await Navigator.of(context).push<List<EmergencyContact>>(
      MaterialPageRoute<List<EmergencyContact>>(
        builder: (context) => SetupScreen(initialContacts: _contacts),
      ),
    );

    if (updatedContacts == null) {
      return;
    }

    await _contactStore.saveContacts(updatedContacts);

    if (!mounted) {
      return;
    }

    setState(() {
      _contacts = updatedContacts;
    });

    _showSnack('Contacts updated.');
  }

  Future<void> _triggerSos() async {
    if (_isLoading || _isDispatching) {
      return;
    }

    if (_contacts.isEmpty) {
      _showSnack('Add emergency contacts first.');
      await _openSetupScreen();
      return;
    }

    setState(() {
      _isDispatching = true;
    });

    final result = await _dispatcher.dispatch(contacts: _contacts);

    if (!mounted) {
      return;
    }

    setState(() {
      _isDispatching = false;
    });

    _showDispatchResult(result);
  }

  void _showDispatchResult(SosDispatchResult result) {
    _showSnack(result.shortSummary);
    if (result.warnings.isEmpty) {
      return;
    }

    showModalBottomSheet<void>(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'System Notes',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                const SizedBox(height: 12),
                for (final warning in result.warnings)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text('- $warning'),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showCapabilitiesSheet() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Platform: ${_capabilities.platformLabel}',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text('Emergency number: ${_capabilities.emergencyNumber}'),
                Text('Country code: ${_capabilities.countryCode.isEmpty ? 'N/A' : _capabilities.countryCode}'),
                Text('Foreground execution: ${_boolLabel(_capabilities.supportsForegroundExecution)}'),
                Text(
                  'Background location: ${_boolLabel(_capabilities.supportsBackgroundLocationRefresh)}',
                ),
                Text('Silent SMS: ${_boolLabel(_capabilities.supportsSilentSmsSending)}'),
                Text('Silent emergency dial: ${_boolLabel(_capabilities.supportsSilentEmergencyDial)}'),
              ],
            ),
          ),
        );
      },
    );
  }

  static String _boolLabel(bool value) => value ? 'supported' : 'not supported';

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Color _currentLightColor() {
    final phase = _pulseController.value;
    if (_isDispatching) {
      return phase > 0.5 ? const Color(0xFFFF3B30) : const Color(0xFF2D6BFF);
    }
    return Color.lerp(
          const Color(0xFF5A0000),
          const Color(0xFF001A4A),
          phase,
        ) ??
        const Color(0xFF5A0000);
  }

  int _contactCount() => _contacts.length;

  @override
  Widget build(BuildContext context) {
    final color = _currentLightColor();
    final isWide = MediaQuery.sizeOf(context).width >= 920;
    final contentPadding = EdgeInsets.symmetric(
      horizontal: isWide ? 32 : 20,
      vertical: isWide ? 24 : 18,
    );

    return Scaffold(
      backgroundColor: const Color(0xFF050816),
      appBar: AppBar(
        title: const Text('Tython X SOS'),
        actions: <Widget>[
          if (kIsWeb)
            const Padding(
              padding: EdgeInsets.only(right: 12),
              child: Center(
                child: _StatusPill(
                  label: 'Web preview',
                  backgroundColor: Color(0xFF18233F),
                ),
              ),
            ),
          IconButton(
            onPressed: _showCapabilitiesSheet,
            icon: const Icon(Icons.info_outline),
            tooltip: 'System capabilities',
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          return DecoratedBox(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.topLeft,
                radius: 1.3,
                colors: <Color>[
                  Color(0xFF15203F),
                  Color(0xFF090D1B),
                  Color(0xFF050816),
                ],
                stops: <double>[0.0, 0.55, 1.0],
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: contentPadding,
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1120),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        _HeroPanel(
                          contactCount: _contactCount(),
                          emergencyNumber: _capabilities.emergencyNumber,
                          platformLabel: _capabilities.platformLabel,
                          isDispatching: _isDispatching,
                          onOpenContacts: _openSetupScreen,
                          onShowCapabilities: _showCapabilitiesSheet,
                          onSendSos: _triggerSos,
                        ),
                        const SizedBox(height: 18),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final stackCards = constraints.maxWidth < 760;
                            return Flex(
                              direction: stackCards ? Axis.vertical : Axis.horizontal,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: <Widget>[
                                Expanded(
                                  child: _InfoCard(
                                    title: 'What it does',
                                    icon: Icons.shield_outlined,
                                    child: const Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: <Widget>[
                                        _BulletPoint('One long press triggers the SOS flow.'),
                                        _BulletPoint('Contacts are stored locally and reused.'),
                                        _BulletPoint('Emergency number adapts to the country.'),
                                      ],
                                    ),
                                  ),
                                ),
                                SizedBox(width: stackCards ? 0 : 16, height: stackCards ? 16 : 0),
                                Expanded(
                                  child: _InfoCard(
                                    title: 'How to test',
                                    icon: Icons.touch_app_outlined,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: <Widget>[
                                        _BulletPoint(
                                          kIsWeb
                                              ? 'Tap the SOS button to simulate dispatch in the browser.'
                                              : 'Press and hold the SOS button to activate dispatch.',
                                        ),
                                        const _BulletPoint('Open contacts to add mother, friend, or guardian.'),
                                        const _BulletPoint('Use the info button to check platform support.'),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                        const SizedBox(height: 18),
                        _StatusBoard(
                          isLoading: _isLoading,
                          isDispatching: _isDispatching,
                          contactCount: _contactCount(),
                          emergencyNumber: _capabilities.emergencyNumber,
                          platformLabel: _capabilities.platformLabel,
                        ),
                        const SizedBox(height: 18),
                        _SosControl(
                          color: color,
                          isDispatching: _isDispatching,
                          onPrimaryAction: _triggerSos,
                          onSecondaryAction: _openSetupScreen,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({
    required this.contactCount,
    required this.emergencyNumber,
    required this.platformLabel,
    required this.isDispatching,
    required this.onOpenContacts,
    required this.onShowCapabilities,
    required this.onSendSos,
  });

  final int contactCount;
  final String emergencyNumber;
  final String platformLabel;
  final bool isDispatching;
  final VoidCallback onOpenContacts;
  final VoidCallback onShowCapabilities;
  final VoidCallback? onSendSos;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF30426D)),
        color: const Color(0xFF0A1122).withValues(alpha: 0.92),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x66000000),
            blurRadius: 28,
            offset: Offset(0, 16),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 760;
            final side = compact ? 18.0 : 28.0;
            return Flex(
              direction: compact ? Axis.vertical : Axis.horizontal,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: <Widget>[
                          const _StatusPill(
                            label: 'Emergency SOS',
                            backgroundColor: Color(0xFF1C2847),
                          ),
                          _StatusPill(
                            label: platformLabel,
                            backgroundColor: const Color(0xFF12203D),
                          ),
                          _StatusPill(
                            label: contactCount == 0 ? 'No contacts yet' : '$contactCount contacts ready',
                            backgroundColor: contactCount == 0
                                ? const Color(0xFF5A1D1D)
                                : const Color(0xFF1E3C2C),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      const Text(
                        'One press. One signal. Immediate help.',
                        style: TextStyle(
                          fontSize: 34,
                          height: 1.05,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'A fast emergency screen for family safety. Add trusted contacts, keep the number simple, and use one clear action when something goes wrong.',
                        style: TextStyle(
                          fontSize: 16,
                          height: 1.5,
                          color: Color(0xFFB9C4E6),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: <Widget>[
                          FilledButton.icon(
                            onPressed: onOpenContacts,
                            icon: const Icon(Icons.contacts_outlined),
                            label: Text(contactCount == 0 ? 'Add contacts' : 'Manage contacts'),
                          ),
                          OutlinedButton.icon(
                            onPressed: onShowCapabilities,
                            icon: const Icon(Icons.info_outline),
                            label: const Text('System info'),
                          ),
                          if (onSendSos != null)
                            FilledButton.tonalIcon(
                              onPressed: onSendSos,
                              icon: Icon(isDispatching ? Icons.hourglass_top : Icons.campaign_outlined),
                              label: Text(isDispatching ? 'Sending SOS...' : 'Test SOS now'),
                            ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Emergency number: $emergencyNumber',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF9EB0E6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: compact ? 0 : side, height: compact ? side : 0),
                _HeroRing(
                  color: isDispatching ? const Color(0xFFFF3B30) : const Color(0xFF2D6BFF),
                  isDispatching: isDispatching,
                  onPressed: onSendSos,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _HeroRing extends StatelessWidget {
  const _HeroRing({
    required this.color,
    required this.isDispatching,
    required this.onPressed,
  });

  final Color color;
  final bool isDispatching;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkResponse(
        onTap: onPressed,
        radius: 120,
        containedInkWell: true,
        child: Container(
          width: 250,
          height: 250,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: <Color>[
                color.withValues(alpha: 0.95),
                color.withValues(alpha: 0.7),
                const Color(0xFF08101F),
              ],
              stops: const <double>[0.0, 0.55, 1.0],
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: color.withValues(alpha: 0.42),
                blurRadius: isDispatching ? 56 : 44,
                spreadRadius: isDispatching ? 22 : 14,
              ),
            ],
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Icon(
                  isDispatching ? Icons.campaign_outlined : Icons.warning_amber_rounded,
                  color: Colors.white,
                  size: 88,
                ),
                const SizedBox(height: 12),
                const Text(
                  'SOS',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  isDispatching ? 'Dispatching now' : 'Hold to activate',
                  style: const TextStyle(
                    color: Color(0xFFD9E4FF),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusBoard extends StatelessWidget {
  const _StatusBoard({
    required this.isLoading,
    required this.isDispatching,
    required this.contactCount,
    required this.emergencyNumber,
    required this.platformLabel,
  });

  final bool isLoading;
  final bool isDispatching;
  final int contactCount;
  final String emergencyNumber;
  final String platformLabel;

  @override
  Widget build(BuildContext context) {
    final items = <_StatItem>[
      _StatItem(label: 'Contacts', value: isLoading ? 'Loading' : '$contactCount'),
      _StatItem(label: 'Mode', value: isDispatching ? 'Dispatching' : 'Ready'),
      _StatItem(label: 'Platform', value: platformLabel),
      _StatItem(label: 'Emergency', value: emergencyNumber),
    ];

    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFF0A1122).withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF2D3F65)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isNarrow = constraints.maxWidth < 700;
            return Wrap(
              spacing: 12,
              runSpacing: 12,
              children: items
                  .map(
                    (item) => SizedBox(
                      width: isNarrow ? (constraints.maxWidth - 12) / 2 : (constraints.maxWidth - 36) / 4,
                      child: _MetricTile(label: item.label, value: item.value),
                    ),
                  )
                  .toList(growable: false),
            );
          },
        ),
      ),
    );
  }
}

class _SosControl extends StatelessWidget {
  const _SosControl({
    required this.color,
    required this.isDispatching,
    required this.onPrimaryAction,
    required this.onSecondaryAction,
  });

  final Color color;
  final bool isDispatching;
  final VoidCallback onPrimaryAction;
  final VoidCallback onSecondaryAction;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF30426D)),
        color: const Color(0xFF0A1122).withValues(alpha: 0.92),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 760;
            return Flex(
              direction: compact ? Axis.vertical : Axis.horizontal,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text(
                        'Emergency control',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Use the button below to test the dispatch flow. On mobile, keep the long-press pattern in mind for the actual emergency action.',
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.5,
                          color: Color(0xFFB9C4E6),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: <Widget>[
                          FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: color,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                            ),
                            onPressed: onPrimaryAction,
                            child: Text(isDispatching ? 'Dispatching...' : 'Trigger SOS'),
                          ),
                          OutlinedButton(
                            onPressed: onSecondaryAction,
                            child: const Text('Open contacts'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(width: compact ? 0 : 20, height: compact ? 20 : 0),
                DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    color: const Color(0xFF111B36),
                    border: Border.all(color: const Color(0xFF25365F)),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'Quick flow',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 10),
                        Text('1. Add trusted contacts', style: TextStyle(color: Color(0xFFCAD6F8))),
                        SizedBox(height: 6),
                        Text('2. Hold the SOS button', style: TextStyle(color: Color(0xFFCAD6F8))),
                        SizedBox(height: 6),
                        Text('3. Dispatcher opens SMS / dialer', style: TextStyle(color: Color(0xFFCAD6F8))),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.title,
    required this.icon,
    required this.child,
  });

  final String title;
  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFF0A1122).withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF28395F)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Icon(icon, color: const Color(0xFF8FB3FF)),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            child,
          ],
        ),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFF101A31),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF25365F)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF9AB0E8),
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BulletPoint extends StatelessWidget {
  const _BulletPoint(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Icon(Icons.fiber_manual_record, size: 10, color: Color(0xFF7FA6FF)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: Color(0xFFD3DCF8),
                fontSize: 14,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.label,
    required this.backgroundColor,
  });

  final String label;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white12),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _StatItem {
  const _StatItem({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;
}
