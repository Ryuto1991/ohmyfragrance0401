interface CreateCheckoutSessionParams {
  labelId: string;
  scent: string;
  priceId: string;
}

export async function createCheckoutSession({
  labelId,
  scent,
  priceId,
}: CreateCheckoutSessionParams): Promise<string> {
  // セッション作成用のAPIを呼び出し
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      labelId,
      scent,
      priceId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { url } = await response.json();
  return url;
}