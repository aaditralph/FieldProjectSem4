import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const SPACING = 16; // 8pt grid base (8 * 2)
const BORDER_RADIUS = 20;

// Theme Colors
const COLORS = {
  background: '#0B0F19',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
  primary: '#10B981', // Neon Green
  secondary: '#14B8A6', // Teal
  text: '#FFFFFF',
  textDim: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.1)',
};

// Reusable Button Component
const AnimatedButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon 
}: { 
  title: string; 
  onPress: () => void; 
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <MotiView
      transition={{ type: 'spring', damping: 15 }}
      style={{ flex: 1, marginHorizontal: 4 }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {isPrimary || variant === 'secondary' ? (
          <LinearGradient
            colors={isPrimary ? [COLORS.primary, COLORS.secondary] : [COLORS.surface, COLORS.surfaceHighlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, isOutline && styles.buttonOutline]}
          >
            {icon && <Ionicons name={icon} size={20} color={isPrimary ? '#000' : COLORS.text} style={{ marginRight: 8 }} />}
            <Text style={[styles.buttonText, { color: isPrimary ? '#000' : COLORS.text }]}>{title}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.button, styles.buttonOutline]}>
            {icon && <Ionicons name={icon} size={20} color={COLORS.text} style={{ marginRight: 8 }} />}
            <Text style={styles.buttonText}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

// Reusable Card Component
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.glassCard, style]}>
    {children}
  </View>
);

export default function CitizenHomeNew() {
  const router = useRouter();
  const [expandedBlog, setExpandedBlog] = useState<number | null>(null);

  const handleSchedulePickup = () => {
    router.push('/(tabs)/citizen/create');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. ANIMATED HERO SECTION */}
      <View style={styles.heroSection}>
        {/* Floating Background Elements */}
        <MotiView
          from={{ translateY: -10, opacity: 0.5 }}
          animate={{ translateY: 10, opacity: 0.8 }}
          transition={{ loop: true, type: 'timing', duration: 3000 }}
          style={[styles.floatingBlob, { top: -20, left: -40, backgroundColor: COLORS.primary }]}
        />
        <MotiView
          from={{ translateY: 10, opacity: 0.5 }}
          animate={{ translateY: -10, opacity: 0.8 }}
          transition={{ loop: true, type: 'timing', duration: 4000 }}
          style={[styles.floatingBlob, { bottom: -20, right: -40, backgroundColor: COLORS.secondary }]}
        />

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.heroContent}
        >
          <MotiView 
            from={{ scale: 0.8 }} 
            animate={{ scale: 1 }} 
            transition={{ loop: true, type: 'timing', duration: 2500 }}
            style={styles.heroIconContainer}
          >
            <Ionicons name="earth" size={64} color={COLORS.primary} />
          </MotiView>
          
          <Text style={styles.heroTitle}>Turn Your E-Waste</Text>
          <Text style={styles.heroTitleHighlight}>Into Impact</Text>
          
          <Text style={styles.heroSubtitle}>
            Millions of tons of toxic e-waste end up in landfills every year. Join the movement to recycle responsibly and protect our planet.
          </Text>

          <View style={styles.heroButtons}>
            <AnimatedButton 
              title="Schedule Pickup" 
              onPress={handleSchedulePickup} 
              icon="calendar-outline" 
            />
          </View>
        </MotiView>
      </View>

      {/* 2. QUICK STATS SECTION */}
      <View style={styles.section}>
        <MotiText 
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 300 }}
          style={styles.sectionTitle}
        >
          Why It Matters
        </MotiText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          {[
            { icon: 'trash-bin-outline', stat: '50M+', label: 'Tons yearly' },
            { icon: 'refresh-circle-outline', stat: '20%', label: 'Only recycled' },
            { icon: 'warning-outline', stat: 'Toxic', label: 'Harm environment' }
          ].map((item, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 400 + index * 100 }}
            >
              <GlassCard style={styles.statCard}>
                <Ionicons name={item.icon as any} size={32} color={COLORS.primary} />
                <Text style={styles.statValue}>{item.stat}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </GlassCard>
            </MotiView>
          ))}
        </ScrollView>
      </View>

      {/* 3. E-WASTE COLLECTION PROCESS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <GlassCard style={styles.processCard}>
          {[
            { step: 1, title: 'Create Request', icon: 'create-outline', desc: 'Schedule a pickup from your home.' },
            { step: 2, title: 'Admin Review', icon: 'checkmark-circle-outline', desc: 'Your request is reviewed and approved.' },
            { step: 3, title: 'OTP Generated', icon: 'key-outline', desc: 'Secure OTP shared with you.' },
            { step: 4, title: 'Agent Assigned', icon: 'person-outline', desc: 'A verified pickup agent is assigned.' },
            { step: 5, title: 'Agent Visits', icon: 'bicycle-outline', desc: 'Agent arrives at your address.' },
            { step: 6, title: 'E-Waste Collected', icon: 'cube-outline', desc: 'Items are securely collected.' },
            { step: 7, title: 'Share OTP', icon: 'shield-checkmark-outline', desc: 'Share OTP to confirm completion.' },
          ].map((item, index, arr) => (
            <View key={index} style={styles.processRow}>
              <View style={styles.processTimeline}>
                <View style={styles.processNode}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                </View>
                {index < arr.length - 1 && <View style={styles.processLine} />}
              </View>
              <MotiView 
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 600 + index * 100 }}
                style={styles.processContent}
              >
                <Text style={styles.processTitle}>{item.step}. {item.title}</Text>
                <Text style={styles.processDesc}>{item.desc}</Text>
              </MotiView>
            </View>
          ))}
        </GlassCard>
      </View>

      {/* 4. WHAT YOU CAN DO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What You Can Do</Text>
        <View style={styles.actionGrid}>
          {[
            { title: 'Recycle', icon: 'leaf-outline', color: '#10B981' },
            { title: 'Donate', icon: 'heart-outline', color: '#F43F5E' },
            { title: 'Reduce', icon: 'arrow-down-outline', color: '#3B82F6' },
            { title: 'Sustain', icon: 'battery-charging-outline', color: '#F59E0B' },
          ].map((item, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 800 + index * 100 }}
              style={styles.actionCardContainer}
            >
              <GlassCard style={styles.actionCard}>
                <View style={[styles.actionIconBg, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.actionTitle}>{item.title}</Text>
              </GlassCard>
            </MotiView>
          ))}
        </View>
      </View>

      {/* COMMUNITY DRIVES EXPLANATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Drives</Text>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 850 }}
        >
          <GlassCard style={{ padding: SPACING * 1.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING }}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.2)', marginBottom: 0, marginRight: SPACING }]}>
                <Ionicons name="people-outline" size={28} color="#3B82F6" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1 }}>
                Together for a Greener Tomorrow
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 22, marginBottom: SPACING }}>
              Community Drives are neighborhood initiatives where residents, societies, and local groups come together to collect e-waste in bulk. Instead of individual pickups, these drives allow us to efficiently manage large quantities of e-waste from a single location on a designated day.
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 22 }}>
              Participating in or organizing a drive helps reduce transportation emissions, creates awareness among your neighbors, and makes a massive collective impact on the environment. Look out for upcoming drives in your area!
            </Text>
          </GlassCard>
        </MotiView>
      </View>

      {/* EDUCATIONAL BLOG SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>E-Waste Education Hub</Text>
        {BLOGS.map((blog, index) => {
          const isExpanded = expandedBlog === index;
          return (
            <MotiView
              key={index}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 900 + index * 50 }}
            >
              <View style={styles.blogCard}>
                <TouchableOpacity 
                  style={styles.blogHeader} 
                  activeOpacity={0.7}
                  onPress={() => setExpandedBlog(isExpanded ? null : index)}
                >
                  <Text style={styles.blogTitle}>{blog.title}</Text>
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.blogContentContainer}>
                    {blog.content.split('\n\n').map((paragraph, pIndex) => (
                      <Text key={pIndex} style={styles.blogContent}>
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </MotiView>
          );
        })}
      </View>

      {/* 5. CALL TO ACTION SECTION */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1000 }}
        style={[styles.section, styles.ctaSection]}
      >
        <LinearGradient
          colors={['#10B981', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaTitle}>Start Your E-Waste Journey Today</Text>
          <Text style={styles.ctaSubtitle}>Every device recycled is a step towards a greener future.</Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handleSchedulePickup}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Request Pickup Now</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </MotiView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const BLOGS = [
  {
    title: 'What is E-Waste? A Growing Global Concern',
    content: `Electronic waste, commonly known as e-waste, refers to discarded electronic and electrical devices. This includes everything from smartphones and laptops to refrigerators, televisions, and batteries.

With rapid technological advancements and frequent upgrades, devices are being replaced faster than ever. As a result, e-waste has become one of the fastest-growing waste streams in the world.

According to the Global E-waste Monitor, the world generated approximately 62 million tonnes of e-waste in 2022, and this number is expected to increase significantly in the coming years. Alarmingly, only a small fraction of this waste is properly recycled.

E-waste is not just ordinary garbage. It contains both valuable materials like gold, silver, and copper, and hazardous substances such as lead, mercury, and cadmium. If not handled properly, it can cause serious environmental and health issues.

Understanding what e-waste is is the first step toward responsible consumption and disposal.`
  },
  {
    title: 'Environmental Impact of E-Waste',
    content: `E-waste poses a serious threat to the environment due to the toxic materials it contains.

When electronic waste is dumped in landfills, harmful chemicals seep into the soil. This leads to soil degradation and affects agricultural productivity. Over time, these toxins can reach groundwater, making it unsafe for human consumption.

Another major issue is air pollution. In many informal recycling sectors, e-waste is burned to extract valuable metals. This process releases toxic gases such as dioxins and fine particulate matter into the air, contributing to respiratory problems and climate change.

E-waste also disrupts ecosystems. Toxic substances enter food chains, affecting plants, animals, and eventually humans. This process, known as bioaccumulation, has long-term consequences on biodiversity.

The environmental damage caused by e-waste is often irreversible, making proper management crucial.`
  },
  {
    title: 'How E-Waste Affects Human Health',
    content: `E-waste doesn’t just harm the environment—it directly impacts human health.

Many electronic devices contain hazardous substances:

• Lead can damage the brain and nervous system
• Mercury affects the kidneys and immune system
• Cadmium can cause lung and bone damage

People working in informal recycling sectors are especially vulnerable. Without protective equipment, they are exposed to toxic chemicals daily. This can lead to chronic illnesses, including respiratory diseases, organ damage, and even cancer.

Children are at even greater risk. Exposure to e-waste toxins during developmental stages can result in lifelong health problems.

The health impact of e-waste is a silent crisis affecting millions of people worldwide.`
  },
  {
    title: 'Case Study – Guiyu, China: From Dumping Ground to Reform',
    content: `Guiyu was once known as the world’s largest e-waste dumping site.

For years, workers in Guiyu manually dismantled electronics and burned components to extract metals. This led to extreme environmental pollution. Studies found dangerously high levels of lead in children living in the area, along with contaminated water and air.

Recognizing the crisis, the Chinese government intervened by:

• Establishing regulated recycling facilities
• Banning informal processing methods
• Introducing strict environmental laws

Today, Guiyu has significantly improved, transitioning toward safer and more sustainable recycling practices.

This case highlights both the dangers of unregulated e-waste and the impact of strong policy action.`
  },
  {
    title: 'Case Study – Agbogbloshie, Ghana: The Human Cost of E-Waste',
    content: `Agbogbloshie is one of the largest e-waste dumps in the world.

Here, thousands of workers rely on e-waste recycling for their livelihood. However, the methods used are highly dangerous. Workers often burn electronic components to recover metals, exposing themselves to toxic fumes.

The area is heavily polluted:

• Soil contains high levels of heavy metals
• Air is filled with toxic smoke
• Nearby water sources are contaminated

Despite the risks, many workers continue due to lack of alternative employment.

This case illustrates the complex balance between economic survival and environmental and health risks.`
  },
  {
    title: 'E-Waste in India: Challenges and Opportunities',
    content: `India is the third-largest producer of e-waste globally. A significant portion of this waste is handled by the informal sector.

Cities like Delhi and Moradabad have become major recycling hubs, where workers manually dismantle electronics without proper safety measures.

To address this issue, the government introduced the E-Waste Management Rules (2016), focusing on:

• Extended Producer Responsibility (EPR)
• Formal recycling systems
• Awareness and collection mechanisms

While progress has been made, challenges remain in implementation and public awareness.

India has a unique opportunity to turn e-waste into an economic advantage by investing in sustainable recycling infrastructure.`
  },
  {
    title: 'Global Efforts to Tackle E-Waste',
    content: `Managing e-waste requires global cooperation.

The Basel Convention regulates the movement of hazardous waste between countries, aiming to prevent illegal dumping.

Many countries are adopting Extended Producer Responsibility (EPR) policies, making manufacturers responsible for the disposal of their products.

Technological innovations are also helping:

• Advanced recycling techniques
• Eco-friendly product design
• Circular economy models

These efforts are essential to reduce the growing burden of e-waste.`
  },
  {
    title: 'What You Can Do to Reduce E-Waste',
    content: `E-waste management is not just a government responsibility—it starts with individuals.

You can make a difference by:

• Repairing devices instead of replacing them
• Donating or reselling old electronics
• Using certified e-waste recycling centers

Small actions, when adopted widely, can significantly reduce the environmental impact.

E-waste is not just waste—it is a resource. Responsible handling can protect the planet while recovering valuable materials.`
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    padding: SPACING * 2,
    paddingTop: SPACING * 4,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  floatingBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    filter: 'blur(40px)', // web only, fallback is low opacity
    opacity: 0.15,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING * 1.5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroTitleHighlight: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING * 2,
    paddingHorizontal: SPACING,
  },
  heroButtons: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: SPACING,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: SPACING,
    marginBottom: SPACING * 2.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING * 1.5,
    paddingHorizontal: SPACING / 2,
  },
  statsScroll: {
    paddingLeft: SPACING / 2,
    paddingRight: SPACING * 1.5,
    gap: SPACING,
  },
  glassCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statCard: {
    width: 140,
    padding: SPACING * 1.5,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textDim,
    marginTop: 4,
    fontWeight: '500',
  },
  processCard: {
    padding: SPACING,
    marginHorizontal: SPACING / 2,
  },
  processRow: {
    flexDirection: 'row',
    marginBottom: 0, // spacing handled by line
  },
  processTimeline: {
    alignItems: 'center',
    width: 40,
  },
  processNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    zIndex: 2,
  },
  processLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  processContent: {
    flex: 1,
    paddingLeft: SPACING,
    paddingBottom: SPACING * 1.5,
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  processDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING,
    paddingHorizontal: SPACING / 2,
  },
  actionCardContainer: {
    width: (width - SPACING * 4) / 2,
  },
  actionCard: {
    padding: SPACING * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  ctaSection: {
    marginHorizontal: SPACING,
    marginTop: SPACING,
  },
  ctaGradient: {
    borderRadius: BORDER_RADIUS,
    padding: SPACING * 2,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
    textAlign: 'center',
    marginBottom: SPACING * 2,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS,
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  blogCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING,
    overflow: 'hidden',
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING * 1.5,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    paddingRight: SPACING,
  },
  blogContentContainer: {
    paddingHorizontal: SPACING * 1.5,
    paddingBottom: SPACING * 1.5,
  },
  blogContent: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 22,
    marginBottom: 8,
  },
});
