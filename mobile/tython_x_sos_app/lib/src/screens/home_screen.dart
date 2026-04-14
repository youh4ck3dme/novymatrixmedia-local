import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../core/contact.dart';
import '../core/platform_capabilities.dart';
import '../services/contact_store.dart';
import '../services/sos_dispatcher.dart';
import 'setup_screen.dart';
import '../widgets/home_widgets.dart';

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
  late final Connectivity _connectivity;

  List<EmergencyContact> _contacts = const <EmergencyContact>[];
  bool _isLoading = true;
  bool _isDispatching = false;
  bool _isOffline = false;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

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
    _connectivity = Connectivity();
    _listenConnectivity();
    _bootstrap();
  }

  void _listenConnectivity() {
    _connectivitySub?.cancel();
    _connectivitySub = _connectivity.onConnectivityChanged.listen((results) {
      final offline = results.isEmpty ||
          results.every((result) => result == ConnectivityResult.none);
      if (offline == _isOffline) {
        return;
      }
      setState(() {
        _isOffline = offline;
      });
    });
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
                child: StatusPill(
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
              color: Color(0xFF050816),
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
                        if (_isOffline)
                          const OfflineBanner(
                            message: 'Offline mode: SOS actions will open once network returns.',
                          ),
                        HeroPanel(
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
                                  child: InfoCard(
                                    title: 'What it does',
                                    icon: Icons.shield_outlined,
                                    child: const Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: <Widget>[
                                        BulletPoint('One long press triggers the SOS flow.'),
                                        BulletPoint('Contacts are stored locally and reused.'),
                                        BulletPoint('Emergency number adapts to the country.'),
                                      ],
                                    ),
                                  ),
                                ),
                                SizedBox(width: stackCards ? 0 : 16, height: stackCards ? 16 : 0),
                                Expanded(
                                  child: InfoCard(
                                    title: 'How to test',
                                    icon: Icons.touch_app_outlined,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: <Widget>[
                                        BulletPoint(
                                          'Tap the SOS button to simulate dispatch in the browser.',
                                        ),
                                        const BulletPoint('Open contacts to add mother, friend, or guardian.'),
                                        const BulletPoint('Use the info button to check platform support.'),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                        const SizedBox(height: 18),
                        StatusBoard(
                          isLoading: _isLoading,
                          isDispatching: _isDispatching,
                          contactCount: _contactCount(),
                          emergencyNumber: _capabilities.emergencyNumber,
                          platformLabel: _capabilities.platformLabel,
                        ),
                        const SizedBox(height: 18),
                        SosControl(
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
    _connectivitySub?.cancel();
    super.dispose();
  }
}
