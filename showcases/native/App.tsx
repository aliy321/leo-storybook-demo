import * as React from 'react';
import { View, Text } from 'react-native';
import { Button, ButtonText } from '@leo/native/button';
import { Theme } from '@leo/tokens/rn';

export default function App() {
  return (
    <Theme name="default" colorScheme="light">
      <View style={{ padding: 24 }}>
        <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: '600' }}>
          @leo/native/button consumer proof
        </Text>
        <Button variant="default" size="default">
          <ButtonText>Click Me</ButtonText>
        </Button>
      </View>
    </Theme>
  );
}
