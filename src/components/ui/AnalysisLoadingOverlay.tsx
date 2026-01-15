import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { AnalysisStep } from '../../types';

interface AnalysisLoadingOverlayProps {
    visible: boolean;
    currentStep: AnalysisStep;
    mode?: 'image' | 'text';
}

const IMAGE_STEPS: { key: AnalysisStep; label: string }[] = [
    { key: 'uploading', label: 'Uploading image to database' },
    { key: 'analyzing', label: 'AI is processing the image' },
    { key: 'extracting', label: 'Extracting nutritional data' },
    { key: 'completing', label: 'Finalizing analysis' },
];

const TEXT_STEPS: { key: AnalysisStep; label: string }[] = [
    { key: 'parsing', label: 'Parsing meal description' },
    { key: 'estimating', label: 'AI is estimating macros' },
    { key: 'finalizing', label: 'Finalizing results' },
];

const { width } = Dimensions.get('window');

export function AnalysisLoadingOverlay({ visible, currentStep, mode = 'image' }: AnalysisLoadingOverlayProps) {
    const steps = mode === 'image' ? IMAGE_STEPS : TEXT_STEPS;
    const [renderOverlay, setRenderOverlay] = React.useState(visible);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (visible) {
            setRenderOverlay(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setRenderOverlay(false));
        }
    }, [visible]);

    if (!renderOverlay && !visible) return null;

    const getStepIndex = (step: AnalysisStep) => {
        if (step === 'done') return steps.length;
        return steps.findIndex(s => s.key === step);
    };

    const currentStepIndex = getStepIndex(currentStep);

    return (
        <Modal
            transparent={true}
            visible={visible || renderOverlay}
            animationType="none"
            onRequestClose={() => { }}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.card}>
                        <Text style={styles.title}>AI Meal Analysis</Text>
                        <View style={styles.stepsContainer}>
                            {steps.map((step, index) => {
                                const isCompleted = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const isPending = index > currentStepIndex;

                                return (
                                    <View key={step.key} style={styles.stepRow}>
                                        <View style={styles.iconContainer}>
                                            {isCompleted ? (
                                                <CheckCircle2 size={24} color={COLORS.success} />
                                            ) : isCurrent ? (
                                                <AnimatedIcon color={COLORS.primary} />
                                            ) : (
                                                <Circle size={24} color={COLORS.border} strokeWidth={1} />
                                            )}
                                            {index < steps.length - 1 && (
                                                <View style={[
                                                    styles.verticalLine,
                                                    { backgroundColor: isCompleted ? COLORS.success : COLORS.border }
                                                ]} />
                                            )}
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={[
                                                styles.stepLabel,
                                                isCurrent && styles.activeStepLabel,
                                                isCompleted && styles.completedStepLabel
                                            ]}>
                                                {step.label}
                                            </Text>
                                            {isCurrent && (
                                                <Text style={styles.subLabel}>This may take a few seconds...</Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

function AnimatedIcon({ color }: { color: string }) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Loader2 size={24} color={color} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        ...SHADOWS.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: COLORS.text,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    stepsContainer: {
        gap: 0,
    },
    stepRow: {
        flexDirection: 'row',
        minHeight: 50, // Reduced from 60
    },
    iconContainer: {
        width: 32,
        alignItems: 'center',
    },
    verticalLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    textContainer: {
        flex: 1,
        marginLeft: SPACING.lg,
        paddingTop: 2,
    },
    stepLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm, // Reduced from base
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: COLORS.textTertiary,
    },
    activeStepLabel: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    completedStepLabel: {
        color: COLORS.success,
    },
    subLabel: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
