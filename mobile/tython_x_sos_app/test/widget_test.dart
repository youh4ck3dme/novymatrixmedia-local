import 'package:flutter_test/flutter_test.dart';
import 'package:tython_x_sos_app/src/core/contact.dart';

void main() {
  test('normalizes and validates emergency contact phone number', () {
    const contact = EmergencyContact(
      name: 'Mama',
      phoneNumber: '+421 901 234 567',
    );

    expect(contact.normalizedPhoneNumber, '+421901234567');
    expect(contact.isValid, isTrue);
  });
}
