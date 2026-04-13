import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../core/contact.dart';

class ContactStore {
  static const _contactsKey = 'tython_sos_contacts_v1';

  Future<List<EmergencyContact>> loadContacts() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_contactsKey);
    if (raw == null || raw.isEmpty) {
      return const <EmergencyContact>[];
    }

    final decoded = jsonDecode(raw);
    if (decoded is! List) {
      return const <EmergencyContact>[];
    }

    return decoded
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .map(EmergencyContact.fromJson)
        .where((contact) => contact.isValid)
        .toList(growable: false);
  }

  Future<void> saveContacts(List<EmergencyContact> contacts) async {
    final prefs = await SharedPreferences.getInstance();
    final payload = contacts
        .where((contact) => contact.isValid)
        .map((contact) => contact.toJson())
        .toList(growable: false);
    await prefs.setString(_contactsKey, jsonEncode(payload));
  }
}
