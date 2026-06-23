import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import { HOME_BALANCE, HOME_USER } from '@/constants/data';
import { icons } from '@/constants/icons';
import images from '@/constants/image';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { subscriptions, addSubscription } = useSubscriptionStore();

  // Get upcoming subscriptions (active subscriptions with renewal date within next 7 days)
  const upcomingSubscriptions = useMemo((): UpcomingSubscription[] => {
    const now = dayjs();
    const nextWeek = now.add(7, 'days');
    return subscriptions
      .filter(
        (sub) =>
          sub.status === 'active' &&
          dayjs(sub.renewalDate).isAfter(now) &&
          dayjs(sub.renewalDate).isBefore(nextWeek),
      )
      .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))
      .map((sub) => ({
        id: sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: dayjs(sub.renewalDate).diff(now, 'day'),
      }));
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    );
    posthog.capture(
      isExpanding ? 'subscription_expanded' : 'subscription_collapsed',
      {
        subscription_name: item.name,
        subscription_id: item.id,
      },
    );
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription);
    posthog.capture('subscription_created', {
      subscription_name: newSubscription.name,
      subscription_price: newSubscription.price,
      subscription_frequency: newSubscription.frequency!,
      subscription_category: newSubscription.category!,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <Pressable onPress={() => setIsModalVisible(true)}>
          <Image
            source={icons.add}
            className="home-add-icon border rounded-full border-gray-300 "
          />
        </Pressable>
      </View>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount, 'KES')}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard data={item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">No upcoming renewals</Text>
                }
              />
            </View>
            <ListHeading title="All Subscriptions" />
          </>
        )}
        keyExtractor={(item) => item.id}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            data={{
              ...item,
              expanded: expandedSubscriptionId === item.id,
              onPress: () => handleSubscriptionPress(item),
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No Subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
