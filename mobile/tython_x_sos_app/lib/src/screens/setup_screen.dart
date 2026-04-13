import 'package:flutter/material.dart';

import '../core/contact.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({
    super.key,
    required this.initialContacts,
  });

  final List<EmergencyContact> initialContacts;

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  late final List<_EditableContact> _editableContacts;

  @override
  void initState() {
    super.initState();
    _editableContacts = widget.initialContacts.isEmpty
        ? <_EditableContact>[
            _EditableContact.empty(),
            _EditableContact.empty(),
          ]
        : widget.initialContacts.map(_EditableContact.fromContact).toList();
  }

  void _addRow() {
    setState(() {
      _editableContacts.add(_EditableContact.empty());
    });
  }

  void _removeRow(int index) {
    if (_editableContacts.length == 1) {
      return;
    }
    setState(() {
      final removed = _editableContacts.removeAt(index);
      removed.dispose();
    });
  }

  void _save() {
    final contacts = _editableContacts
        .map((editable) => editable.toContact())
        .where((contact) => contact.isValid)
        .toList(growable: false);

    if (contacts.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one valid contact.')),
      );
      return;
    }

    Navigator.of(context).pop<List<EmergencyContact>>(contacts);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency contacts'),
        actions: <Widget>[
          IconButton(
            onPressed: _addRow,
            icon: const Icon(Icons.add),
            tooltip: 'Add contact',
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemBuilder: (context, index) {
          final item = _editableContacts[index];
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: TextField(
                  controller: item.nameController,
                  decoration: const InputDecoration(
                    labelText: 'Name',
                    border: OutlineInputBorder(),
                  ),
                  textInputAction: TextInputAction.next,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: item.phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Phone number',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                ),
              ),
              IconButton(
                onPressed: () => _removeRow(index),
                icon: const Icon(Icons.delete_outline),
                tooltip: 'Remove contact',
              ),
            ],
          );
        },
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemCount: _editableContacts.length,
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: FilledButton(
          onPressed: _save,
          child: const Padding(
            padding: EdgeInsets.symmetric(vertical: 14),
            child: Text('Save contacts'),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    for (final editable in _editableContacts) {
      editable.dispose();
    }
    super.dispose();
  }
}

class _EditableContact {
  _EditableContact({
    required this.nameController,
    required this.phoneController,
  });

  factory _EditableContact.empty() {
    return _EditableContact(
      nameController: TextEditingController(),
      phoneController: TextEditingController(),
    );
  }

  factory _EditableContact.fromContact(EmergencyContact contact) {
    return _EditableContact(
      nameController: TextEditingController(text: contact.name),
      phoneController: TextEditingController(text: contact.phoneNumber),
    );
  }

  final TextEditingController nameController;
  final TextEditingController phoneController;

  EmergencyContact toContact() {
    return EmergencyContact(
      name: nameController.text,
      phoneNumber: phoneController.text,
    );
  }

  void dispose() {
    nameController.dispose();
    phoneController.dispose();
  }
}
