<script>
    import { onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js';
    import { PUBLIC_STRIPE_KEY } from '$env/static/public';
    import { Elements, CardNumber, CardExpiry, CardCvc } from '$lib/components/payment';
    import { Spinner } from 'flowbite-svelte';
    import { pageMetaData, newToast } from "$lib/stores";
    import { goto } from "$app/navigation";

    let stripe = null;
    let cardElement;
    let processing = false;

    onMount(async () => {
        stripe = await loadStripe(PUBLIC_STRIPE_KEY);
    });

    async function createPaymentIntent() {
        const response = await fetch('/payment-intent', { method: 'POST' });
        const { clientSecret } = await response.json();

        return clientSecret;
    }

    async function submit() {
        if (processing) return;
        processing = true;

        const clientSecret = await createPaymentIntent();

        // confirm payment with stripe
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement
            }
        });
        
        if (result.error) {
            newToast("error", apiRes.message);
            processing = false;
        } else {
            const res = await fetch("/api/buyCertification", { method:"POST", body:JSON.stringify(result.paymentIntent) });
            const data = await res.json();
            newToast("success", data.message);
            goto('/dashboard');
        }

        processing = false;
    }

    $pageMetaData.title = "Certification";
    $pageMetaData.description = "Buy Twitter certification";
    $pageMetaData.currentPageName = "Certification";
</script>

{#if stripe}
    <div class="w-full flex flex-col gap-4 p-4">
        <form on:submit|preventDefault={submit} class="flex flex-col gap-4">
            <Elements {stripe}>
                <h2>
                    Buy certification
                    <svg viewBox="0 0 22 22" class="w-5 h-5 fill-primary-500 inline-block"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>
                </h2>

                <CardNumber bind:element={cardElement} classes={{ base: 'border text-sm rounded-lg block w-full px-2.5 py-4 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all' }}/>
                
                <div class="flex flex-row gap-4">
                    <CardExpiry classes={{ base: 'border text-sm rounded-lg block w-full px-2.5 py-3 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all' }} />
                    <CardCvc classes={{ base: 'border text-sm rounded-lg block w-full px-2.5 py-3 bg-neutral-800 border-neutral-700 placeholder-neutral-400 text-white focus:ring-primary-500 focus:border-primary-500 focus:outline-none outline-none transition-all' }} />
                </div>
                
                <button disabled={processing} class="button-primary w-full">
                    {#if processing}
                        <Spinner size={5}/>
                    {:else}
                        Pay 19,99€
                    {/if}
                </button>
            </Elements>
        </form>
    </div>
{/if}