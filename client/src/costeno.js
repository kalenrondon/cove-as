const msgRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const roundMessages = {
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

const familyMessages = {
  done: [
    '¡{family} al día! Esa gente sí sabe lo que e\' bueno. 🎉',
    '{family} pagó completico. ¡Eso e\' tener la moral en alto! 💪',
    'La {family} no falla. To\'s pagados, ¡pa\' la playa! 🏖️',
    '¡{family} al 100! El viaje va a estar bueno con esta gente. 🔥',
  ],
  half: [
    '{family}: {done} de {total} pagaron. ¡Los otros aprieten el culo! 😅',
    'En la {family} van {done} pagado(s), faltan {pending}. ¡No se duerman! 😴',
    'La {family} va en {done} de {total}. Casi, casi... ¡despacito pero llegamo\'! 🦥',
  ],
  none: [
    '{family}: cero pagos. ¿En qué van? ¿En bus o en burro? 🤔',
    'La {family} no ha pagado ni uno. ¡Aflojen la billetera! 🏜️',
    '{family} debe\'ando como si el viaje fuera gratis. ¡Despertá! ⏰',
  ],
  fullFamily: [
    '{family} completa al día. ¡Eso e\' tener la casa en orden! 🏠✅',
    'Toda la {family} pagó. Hasta el perro aportó. 🐕💰',
    '{family} es un ejemplo. To\'s pagaron sin regañá. 👏',
  ],
}

export function getRoundMessage(round) {
  const total = round.amount_per_person > 0 ? Math.round(round.total_expected / round.amount_per_person) : 0
  const pct = total > 0 ? round.paid_count / total : 0
  const opts = pct >= 1 ? roundMessages.done : pct > 0.5 ? roundMessages.half : roundMessages.none
  if (round.pending_count === 1 && pct > 0) opts.push(...roundMessages.oneLeft)
  const msg = msgRandom(opts)
  return msg.replace('{done}', round.paid_count).replace('{pending}', round.pending_count)
}

export function getFamilyMessage(familyName, paidCount, totalCount) {
  const pct = totalCount > 0 ? paidCount / totalCount : 0
  const opts = pct >= 1
    ? [...familyMessages.done, ...familyMessages.fullFamily]
    : pct > 0.5
      ? familyMessages.half
      : familyMessages.none
  const msg = msgRandom(opts)
  return msg
    .replace('{family}', familyName)
    .replace('{done}', paidCount)
    .replace('{pending}', totalCount - paidCount)
    .replace('{total}', totalCount)
}
