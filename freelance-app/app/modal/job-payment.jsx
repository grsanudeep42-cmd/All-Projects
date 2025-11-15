import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import UpiPayment from '../components/ui/UpiPayment'; // <- two levels up now

export default function JobPaymentScreen() {
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const jobId = params.jobId ? Number(params.jobId) : undefined;
  const freelancerId = params.freelancerId ? Number(params.freelancerId) : undefined;
  const amount = params.amount ? Number(params.amount) : undefined;

  if (
  jobId === undefined || jobId === null ||
  freelancerId === undefined || freelancerId === null ||
  amount === undefined || amount === null
) {
  return <Text>Missing/invalid payment parameters.</Text>;
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
