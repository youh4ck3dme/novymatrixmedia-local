import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/contact.dart';

abstract class ContactStorage {
  Future<String?> read();
  Future<void> write(String value);
}

class SharedPrefsContactStorage implements ContactStorage {
  SharedPrefsContactStorage(this._prefs);

  final SharedPreferences _prefs;

  static Future<SharedPrefsContactStorage> create() async {
    final prefs = await SharedPreferences.getInstance();
    return SharedPrefsContactStorage(prefs);
  }

  @override
  Future<String?> read() async => _prefs.getString(ContactStore.contactsKey);

  @override
  Future<void> write(String value) async {
    await _prefs.setString(ContactStore.contactsKey, value);
  }
}

class SecureContactStorage implements ContactStorage {
  SecureContactStorage([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  @override
  Future<String?> read() => _storage.read(key: ContactStore.contactsKey);

  @override
  Future<void> write(String value) {
    return _storage.write(key: ContactStore.contactsKey, value: value);
  }
}

class ContactStore {
  ContactStore({ContactStorage? storage}) : _storage = storage;

  static const contactsKey = 'tython_sos_contacts_v2';

  ContactStorage? _storage;

  Future<ContactStorage> _resolveStorage() async {
    if (_storage != null) {
      return _storage!;
    }

    if (kIsWeb) {
      _storage = await SharedPrefsContactStorage.create();
      return _storage!;
    }

    _storage = SecureContactStorage();
    return _storage!;
  }

  Future<List<EmergencyContact>> loadContacts() async {
    final storage = await _resolveStorage();
    final raw = await storage.read();
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
    final storage = await _resolveStorage();
    final payload = contacts
        .where((contact) => contact.isValid)
        .map((contact) => contact.toJson())
        .toList(growable: false);
    await storage.write(jsonEncode(payload));
  }
}
