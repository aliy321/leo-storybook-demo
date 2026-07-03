import * as React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@leo/button';

export default function App() {
  return (
    <View style={{ padding: 24 }}>
      <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: '600' }}>
        @leo/button — RN consumer proof
      </Text>
      <Button label="Click Me" type="filled" color="primary" size="md" />
    </View>
  );
}
