export const costenoMessages = {
  done: [
    '¡Ay ombe! To\' el mundo al día. ¡Eso e\' como pa\' alegrá el alma! 🎉',
    '¡Eso e\'! To\'s pagaron. Coveñas nos espera con los brazos abiertos. 🏖️',
    '¡A la berraca! Esto e\' un family de verdad. 10/10 pagaos. 👏',
    '¡Uy papa! Con to\'s al día, la playa va a estar buena. 🌊',
  ],
  half: [
    'Van {done} pagado(s) y {pending} debe\'ando. ¡Los morosos ponte las pilas que la playa no espera! 🔔',
    'Mijo, la cuenta no se paga solita. Apretá el culo y pagá. 😅',
    'Casi, casi... pero todavía falta. ¡No sea\' pollo y pagá! 🐔',
    'El agua\'e la playa e\' salá, pero los pagos atrasados son más salados todavía. 🧂',
  ],
  none: [
    '¡A la verga! To\' el mundo debe. ¿Esto e\' un viaje o una nova? 😂',
    'Esto ta más seco que el desierto de la Tatacoa. ¡Aflojen la billetera! 🏜️',
    'Cero pesos, cero pagos. ¡Ni pa\' un bus a Coveñas! 🚌',
    'Si esto sigue así, nos vemos en el mapalé en El Copey. 💃',
  ],
  oneLeft: [
    '¡Solo falta {pending}! ¡Dale gasolina, que el plan e\' por allá arriba! ⛽',
    'Un@ quedó debe\'ando. Ya casi, ya casi... ¡No lo dejemo\' plantado! 🪴',
  ],
}

export function getCostenoMessage(round) {
  const total = round.amount_per_person > 0 ? Math.round(round.total_expected / round.amount_per_person) : 0
  const pct = total > 0 ? round.paid_count / total : 0
  const opts = pct >= 1 ? costenoMessages.done : pct > 0.5 ? costenoMessages.half : costenoMessages.none
  if (round.pending_count === 1 && pct > 0) opts.push(...costenoMessages.oneLeft)
  const msg = opts[Math.floor(Math.random() * opts.length)]
  return msg.replace('{done}', round.paid_count).replace('{pending}', round.pending_count)
}
