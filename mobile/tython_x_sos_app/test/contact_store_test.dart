import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tython_x_sos_app/src/core/contact.dart';
import 'package:tython_x_sos_app/src/services/contact_store.dart';

void main() {
  group('ContactStore', () {
    test('saves and loads valid contacts using shared prefs storage', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final storage = SharedPrefsContactStorage(prefs);
      final store = ContactStore(storage: storage);

      const contacts = <EmergencyContact>[
        EmergencyContact(name: 'Eva', phoneNumber: '+421900123456'),
        EmergencyContact(name: 'Tom', phoneNumber: '0900111222'),
      ];

      await store.saveContacts(contacts);
      final loaded = await store.loadContacts();

      expect(loaded.length, 2);
      expect(loaded.first.name, 'Eva');
      expect(loaded.last.normalizedPhoneNumber, '0900111222');
    });

    test('filters invalid contacts', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final storage = SharedPrefsContactStorage(prefs);
      final store = ContactStore(storage: storage);

      const contacts = <EmergencyContact>[
        EmergencyContact(name: '', phoneNumber: '0900'),
        EmergencyContact(name: 'Valid', phoneNumber: '+421900000000'),
      ];

      await store.saveContacts(contacts);
      final loaded = await store.loadContacts();

      expect(loaded.length, 1);
      expect(loaded.single.name, 'Valid');
    });
  });
}
