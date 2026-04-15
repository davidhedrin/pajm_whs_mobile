import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
  ToastConfig,
} from 'react-native-toast-message';
import { ResponsiveScale } from './model-type';

export const toastConfigs = ({ scales }: { scales: ResponsiveScale; }): ToastConfig => ({
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        height: "auto",
        borderLeftColor: '#34D399',
        borderRadius: scales.rpm(10),
        alignItems: "center"
      }}
      contentContainerStyle={{
        paddingVertical: scales.rpm(8),
        paddingHorizontal: scales.rpm(12),
      }}
      text1Style={{
        fontSize: scales.rf(14),
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: scales.rf(13),
        color: '#6B7280',
      }}
      renderTrailingIcon={() => (
        <Ionicons
          name="checkmark-circle-outline"
          size={scales.rf(25)}
          color="#34D399"
          style={{ marginRight: scales.rpm(12) }}
        />
      )}
      text2NumberOfLines={5}
    />
  ),

  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        height: "auto",
        borderLeftColor: '#3B82F6',
        borderRadius: scales.rpm(10),
        alignItems: 'center',
      }}
      contentContainerStyle={{
        paddingVertical: scales.rpm(8),
        paddingHorizontal: scales.rpm(12),
      }}
      text1Style={{
        fontSize: scales.rf(14),
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: scales.rf(13),
        color: '#6B7280',
      }}
      renderTrailingIcon={() => (
        <Ionicons
          name="information-circle-outline"
          size={scales.rf(25)}
          color="#3B82F6"
          style={{ marginRight: scales.rpm(12) }}
        />
      )}
      text2NumberOfLines={5}
    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        height: "auto",
        borderLeftColor: '#F87171',
        borderRadius: scales.rpm(10),
        alignItems: "center"
      }}
      contentContainerStyle={{
        paddingVertical: scales.rpm(8),
        paddingHorizontal: scales.rpm(12),
      }}
      text1Style={{
        fontSize: scales.rf(14),
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: scales.rf(13),
        color: '#6B7280',
      }}
      renderTrailingIcon={() => (
        <Ionicons
          name="warning-outline"
          size={scales.rf(25)}
          color="#F87171"
          style={{ marginRight: scales.rpm(12) }}
        />
      )}
      text2NumberOfLines={5}
    />
  ),
});