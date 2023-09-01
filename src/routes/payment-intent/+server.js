import Stripe from 'stripe';
import { SECRET_STRIPE_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

const stripe = new Stripe(SECRET_STRIPE_KEY);

export async function POST() {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1999,
        currency: 'eur',
        payment_method_types: ['card']
    });
    
    return json({ clientSecret: paymentIntent.client_secret });
}