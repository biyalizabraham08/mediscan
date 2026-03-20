import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Activity, Shield, Zap, Bell, ChevronRight, User, ShieldCheck } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LandingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const createButtonScale = () => {
    const scale = new Animated.Value(1);
    const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    return { scale, onPressIn, onPressOut };
  };

  const primaryBtn = createButtonScale();
  const secondaryBtn = createButtonScale();

  const handleTryDemo = () => {
    const demoProfile = {
      id: 'demo-123',
      full_name: "Demo User",
      blood_group: "O+",
      allergies: "Penicillin",
      medications: "None",
      conditions: "Asthma",
      emergency_contacts: [
        { name: "John Doe", phone: "+91 9876543210", email: "john@example.com", relation: 'Emergency Contact' }
      ]
    };
    navigation.navigate('Emergency', { profile: demoProfile, isDemo: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- ZONE 1: HERO SECTION --- */}
        <LinearGradient
          colors={['#0f172a', '#1e3a8a', '#2563eb']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Subtle Radial Glow Effect */}
          <View style={styles.glow} />
          
          <SafeAreaView style={styles.heroInner}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <View style={styles.badge}>
                <Activity size={20} color="#60a5fa" />
                <Text style={styles.badgeText}>MediScan Premium</Text>
              </View>
              <Text style={styles.title}>Scan. Save. Survive.</Text>
              <Text style={styles.subtext}>
                Instant access to critical medical data in emergencies
              </Text>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        {/* --- ZONE 2: QR EMERGENCY CARD --- */}
        <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim, transform: [{ scale: cardScale }] }]}>
          <View style={styles.emergencyCard}>
            <View style={styles.cardTop}>
              <View style={styles.shieldBox}>
                <ShieldCheck size={18} color="#dc2626" />
                <Text style={styles.emergencyTag}>MEDICAL EMERGENCY</Text>
              </View>
              <Text style={styles.cardCaption}>Scan for critical health information</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.qrContainer}>
              <QRCode
                value="https://mediscan.app/emergency/demo"
                size={200}
                color="#0f172a"
                backgroundColor="white"
              />
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.cardFooterText}>MEDISCAN SECURE ACCESS ID</Text>
            </View>
          </View>
        </Animated.View>

        {/* --- ZONE 3: ACTIONS + FEATURES --- */}
        <View style={styles.bottomZone}>
          <View style={styles.buttonGroup}>
            <AnimatedPressable
              onPressIn={primaryBtn.onPressIn}
              onPressOut={primaryBtn.onPressOut}
              onPress={() => navigation.navigate('Login')}
              style={[styles.primaryBtn, { transform: [{ scale: primaryBtn.scale }] }]}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <ChevronRight size={20} color="white" />
            </AnimatedPressable>

            <AnimatedPressable
              onPressIn={secondaryBtn.onPressIn}
              onPressOut={secondaryBtn.onPressOut}
              onPress={() => navigation.navigate('Login')}
              style={[styles.secondaryBtn, { transform: [{ scale: secondaryBtn.scale }] }]}
            >
              <Text style={styles.secondaryBtnText}>Sign In</Text>
            </AnimatedPressable>

            <TouchableOpacity style={styles.demoBtn} onPress={handleTryDemo}>
              <Text style={styles.demoBtnText}>Try Demo Emergency View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Key Capabilities</Text>
            <View style={styles.featuresRow}>
              <View style={styles.featureTile}>
                <Shield size={22} color="#2563eb" />
                <Text style={styles.featureLabel}>QR Access</Text>
              </View>
              <View style={styles.featureTile}>
                <Zap size={22} color="#2563eb" />
                <Text style={styles.featureLabel}>Impact</Text>
              </View>
              <View style={styles.featureTile}>
                <Bell size={22} color="#2563eb" />
                <Text style={styles.featureLabel}>Alerts</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingBottom: 60 },
  
  // HERO
  heroSection: { height: height * 0.45, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  glow: { 
    position: 'absolute', 
    top: -height * 0.1, 
    left: '20%', 
    width: width * 0.6, 
    height: width * 0.6, 
    backgroundColor: 'rgba(59, 130, 246, 0.4)', 
    borderRadius: 1000, 
    filter: 'blur(100px)' as any // Use as any for typed error avoidance in some envs
  },
  heroInner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginBottom: 20 },
  badgeText: { color: '#60a5fa', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 12, letterSpacing: -1 },
  subtext: { fontSize: 17, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 24, fontWeight: '500' },

  // CARD
  cardWrapper: { alignItems: 'center', marginTop: -120, zIndex: 10, paddingHorizontal: 20 },
  emergencyCard: { 
    backgroundColor: '#fff', 
    width: '100%', 
    maxWidth: 340,
    borderRadius: 32, 
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30 },
      android: { elevation: 20 }
    })
  },
  cardTop: { alignItems: 'center', marginBottom: 16 },
  shieldBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  emergencyTag: { color: '#dc2626', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  cardCaption: { color: '#64748b', fontSize: 12, fontWeight: '500' },
  divider: { height: 1.5, backgroundColor: '#f1f5f9', width: '100%', marginBottom: 20 },
  qrContainer: { padding: 16, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  cardBottom: { marginTop: 20 },
  cardFooterText: { color: '#94a3b8', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  // ACTIONS
  bottomZone: { marginTop: 40, paddingHorizontal: 30 },
  buttonGroup: { gap: 16 },
  primaryBtn: { 
    backgroundColor: '#2563eb', 
    height: 64, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#2563eb', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 15, 
    elevation: 8
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  secondaryBtn: { 
    backgroundColor: '#eff6ff', 
    height: 64, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  secondaryBtnText: { color: '#2563eb', fontSize: 18, fontWeight: 'bold' },
  demoBtn: { alignSelf: 'center', padding: 10 },
  demoBtnText: { color: '#64748b', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },

  // FEATURES
  featuresSection: { marginTop: 48 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between' },
  featureTile: { 
    width: (width - 60 - 30) / 3, 
    backgroundColor: '#f8fafc', 
    padding: 16, 
    borderRadius: 20, 
    alignItems: 'center', 
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  featureLabel: { fontSize: 11, fontWeight: '700', color: '#475569' }
});
