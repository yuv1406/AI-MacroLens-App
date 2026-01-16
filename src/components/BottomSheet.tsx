import React, { forwardRef, ReactNode, useImperativeHandle, useState, useEffect, useRef, useMemo } from 'react';
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

        // Calculate max height based on keyboard - recalculates when keyboardHeight changes
        const maxHeight = React.useMemo(() => {
            if (keyboardHeight > 0) {
                // When keyboard is visible, reduce height to fit above keyboard
                return SCREEN_HEIGHT - keyboardHeight - 50; // 50px for safe area
            }
            return SCREEN_HEIGHT * 0.9; // Default 90% of screen
        }, [keyboardHeight]);

        return (
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleClose}
                hardwareAccelerated={true}
                statusBarTranslucent={Platform.OS === 'android'}
            >
                <View style={styles.backdrop}>
                    <TouchableOpacity
                        style={styles.backdropTouchable}
                        activeOpacity={1}
                        onPress={handleClose}
                    />
                    <View style={[styles.container, { maxHeight }]}>
                        <View style={styles.handle} />
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={[
                                styles.contentContainer,
                                keyboardHeight > 0 && { paddingBottom: keyboardHeight + SPACING.xl }
                            ]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {title && (
                                <View style={styles.header}>
                                    <Text style={styles.title}>{title}</Text>
                                </View>
                            )}
                            {children}
                        </ScrollView>
                    </View>
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
