import 'package:flutter/material.dart';

class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2B1A16),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF5C2E24)),
      ),
      child: Row(
        children: <Widget>[
          const Icon(Icons.wifi_off, color: Color(0xFFF2B29E)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Color(0xFFF5D6CC), fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class HeroPanel extends StatelessWidget {
  const HeroPanel({
    super.key,
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
                          const StatusPill(
                            label: 'Emergency SOS',
                            backgroundColor: Color(0xFF1C2847),
                          ),
                          StatusPill(
                            label: platformLabel,
                            backgroundColor: const Color(0xFF12203D),
                          ),
                          StatusPill(
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
                HeroRing(
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

class HeroRing extends StatelessWidget {
  const HeroRing({
    super.key,
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

class StatusBoard extends StatelessWidget {
  const StatusBoard({
    super.key,
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
    final items = <StatItem>[
      StatItem(label: 'Contacts', value: isLoading ? 'Loading' : '$contactCount'),
      StatItem(label: 'Mode', value: isDispatching ? 'Dispatching' : 'Ready'),
      StatItem(label: 'Platform', value: platformLabel),
      StatItem(label: 'Emergency', value: emergencyNumber),
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
                      child: MetricTile(label: item.label, value: item.value),
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

class SosControl extends StatelessWidget {
  const SosControl({
    super.key,
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

class InfoCard extends StatelessWidget {
  const InfoCard({
    super.key,
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

class MetricTile extends StatelessWidget {
  const MetricTile({
    super.key,
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

class BulletPoint extends StatelessWidget {
  const BulletPoint(this.text, {super.key});

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

class StatusPill extends StatelessWidget {
  const StatusPill({
    super.key,
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

class StatItem {
  const StatItem({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;
}
