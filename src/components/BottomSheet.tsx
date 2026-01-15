import React, { forwardRef, ReactNode, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Modal, ScrollView, TouchableOpacity, Keyboard, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface BottomSheetProps {
    children: ReactNode;
    title?: string;
    onClose?: () => void;
}

export interface BottomSheetHandle {
    snapToIndex: (index: number) => void;
    close: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
    ({ children, title, onClose }, ref) => {
        const [visible, setVisible] = useState(false);
        const scrollViewRef = useRef<ScrollView>(null);
        const [keyboardHeight, setKeyboardHeight] = useState(0);

        useEffect(() => {
            const keyboardWillShow = Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            });

            const keyboardWillHide = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0);
            });

            return () => {
                keyboardWillShow.remove();
                keyboardWillHide.remove();
            };
        }, []);

        useImperativeHandle(ref, () => ({
            snapToIndex: (index: number) => {
                if (index >= 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                    onClose?.();
                }
            },
            close: () => {
                setVisible(false);
                onClose?.();
            },
        }));

        const handleClose = () => {
            Keyboard.dismiss();
            setVisible(false);
            onClose?.();
        };

        // Calculate max height based on keyboard
        const maxHeight = keyboardHeight > 0
            ? SCREEN_HEIGHT - keyboardHeight - 50 // 50px for safe area
            : SCREEN_HEIGHT * 0.9;

        return (
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleClose}
                hardwareAccelerated={true}
            >
                <View style={styles.backdrop}>
                    <TouchableOpacity
                        style={styles.backdropTouchable}
                        activeOpacity={1}
                        onPress={handleClose}
                    />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardView}
                        keyboardVerticalOffset={0}
                    >
                        <View style={[styles.container, { maxHeight }]}>
                            <View style={styles.handle} />
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollView}
                                contentContainerStyle={[
                                    styles.contentContainer,
                                    keyboardHeight > 0 && { paddingBottom: SPACING['2xl'] }
                                ]}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {title && (
                                    <View style={styles.header}>
                                        <Text style={styles.title}>{title}</Text>
                                    </View>
                                )}
                                {children}
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        );
    }
);

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: COLORS.backdrop,
        justifyContent: 'flex-end',
    },
    backdropTouchable: {
        flex: 1,
    },
    keyboardView: {
        width: '100%',
    },
    container: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        minHeight: '85%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: RADIUS.full,
        alignSelf: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
        paddingBottom: SPACING['2xl'],
    },
    header: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
    },
});
