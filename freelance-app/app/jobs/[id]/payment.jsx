import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import UpiPayment from '../../components/ui/UpiPayment';

export default function JobPaymentScreen() {
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const jobId = params.id ? Number(params.id) : undefined;
  const freelancerId = params.freelancerId ? Number(params.freelancerId) : undefined;
  const amount = params.amount ? Number(params.amount) : undefined;

  if (!jobId || !freelancerId || !amount) {
    return <Text style={{ color: 'red' }}>Missing/invalid payment parameters.</Text>;
  }

  return (
    <UpiPayment
      jobId={jobId}
      freelancerId={freelancerId}
      amount={amount}
      token={token}
    />
  );
}
