import type { ExerciseI18n } from '../db/schema'

/** Italian overrides for every curated exercise — name, equipment label,
 * coaching cues, and bulking tip. Anything missing here falls back to the
 * English text in curatedExercises.ts via localizeExercise(). */
export const EXERCISES_IT: Record<string, ExerciseI18n> = {
  // ───────── CHEST ─────────
  'bench-press': {
    name: 'Distensione su panca piana',
    equipment: 'Bilanciere + panca',
    cues: [
      'Stringi le scapole e tirale verso le tasche posteriori, ben piantate sulla panca.',
      'Piedi ben a terra, sedere appoggiato alla panca, leggera curva lombare naturale.',
      'Scendi al petto basso, poi spingi verso l\'alto e leggermente verso la testa — non perfettamente verticale.',
      'Gomiti chiusi a circa 45° dal busto, non aperti. Polsi allineati sopra i gomiti.',
    ],
    bulkingTip:
      'Il re per la parte alta. Fai 4–5 serie effettive intense ma fermati a 1 ripetizione dal cedimento. Aggiungi 2,5 kg quando completi il limite alto del range di ripetizioni per due sessioni di fila.',
  },
  'incline-bench': {
    name: 'Distensione su panca inclinata',
    equipment: 'Bilanciere + panca inclinata (~30°)',
    cues: [
      'Imposta la panca a circa 30 gradi — più ripida diventa una distensione per spalle.',
      'Scapole giù e indietro, petto in alto. Stessa identica postura della panca piana.',
      'Scendi sulla parte alta del petto, sotto le clavicole. Spingi verso l\'alto e leggermente indietro.',
      'Mantieni i gomiti a 45°, mai larghi: protegge le spalle e isola meglio il pettorale alto.',
    ],
    bulkingTip:
      'Il miglior esercizio per il pettorale alto, che spesso resta indietro. Lavora pesante in 6–10 ripetizioni, 3–4 serie. Non scendere troppo veloce: 2 secondi controllati.',
  },
  'incline-db-press': {
    name: 'Distensione con manubri su panca inclinata',
    equipment: 'Manubri + panca inclinata',
    cues: [
      'Parti con i manubri sopra le spalle, palmi rivolti in avanti.',
      'Scendi lentamente fino a sentire lo stretch nel petto — i gomiti scendono leggermente sotto la panca.',
      'Spingi i manubri verso l\'alto fino a quasi toccarli, senza bloccare i gomiti.',
      'Il movimento è leggermente convergente: i manubri si avvicinano salendo.',
    ],
    bulkingTip:
      'I manubri permettono più allungamento del pettorale rispetto al bilanciere — fondamentale per la crescita. 3–4 serie da 8–12.',
  },
  'db-bench-press': {
    name: 'Distensione con manubri su panca piana',
    equipment: 'Manubri + panca',
    cues: [
      'Solleva i manubri usando le gambe per portarli sopra le spalle.',
      'Scendi controllando, gomiti a circa 45°, fino a sentire lo stretch sul petto.',
      'Spingi in alto avvicinando i manubri tra loro, senza farli sbattere.',
      'Riporta giù in 2 secondi — la fase eccentrica è dove cresce il muscolo.',
    ],
    bulkingTip:
      'Range di movimento maggiore rispetto al bilanciere. Ottimo per simmetria sinistra/destra. 8–12 ripetizioni per 3–4 serie.',
  },
  'cable-fly': {
    name: 'Croci ai cavi',
    equipment: 'Cavi alti o bassi',
    cues: [
      'Mantieni una leggera flessione del gomito per tutto il movimento — non bloccarlo dritto.',
      'Pensa di "abbracciare un albero": le mani si incontrano davanti senza piegare ulteriormente i gomiti.',
      'Stringi i pettorali nel punto di contrazione massima per 1 secondo.',
      'Apri lentamente tornando indietro, fino a sentire lo stretch ma senza forzare la spalla.',
    ],
    bulkingTip:
      'L\'esercizio di isolamento perfetto per il petto. Tensione costante tipica dei cavi. Fai per ultimo, 3 serie da 12–15.',
  },
  'pec-deck': {
    name: 'Pec deck (macchina)',
    equipment: 'Macchina pec deck',
    cues: [
      'Siediti con la schiena ben appoggiata, regola il sedile in modo che le maniglie siano all\'altezza del petto.',
      'Stringi le maniglie verso il centro, focalizzandoti sulla contrazione del petto.',
      'Pausa di 1 secondo al centro stringendo forte.',
      'Apri controllando, senza far sbattere i pesi.',
    ],
    bulkingTip:
      'Movimento sicuro e isolato, ottimo per le ultime serie di un allenamento di petto. Spingi le ripetizioni vicino al cedimento.',
  },
  'chest-dip': {
    name: 'Dips per il petto',
    equipment: 'Parallele',
    cues: [
      'Inclina leggermente il busto in avanti per coinvolgere più petto e meno tricipiti.',
      'Scendi controllando finché le spalle non sono sotto i gomiti.',
      'Spingi forte indietro, stringendo i pettorali in alto.',
      'Se troppo facile, aggiungi peso con una cintura zavorrata.',
    ],
    bulkingTip:
      'Eccellente movimento composto per pettorale basso e tricipiti. 3–4 serie fino a poco prima del cedimento.',
  },
  'decline-press': {
    name: 'Distensione su panca declinata',
    equipment: 'Bilanciere + panca declinata',
    cues: [
      'Aggancia bene i piedi sotto i rulli per stabilità.',
      'Scapole strette, scendi alla parte bassa del petto.',
      'Spingi in alto leggermente verso i piedi, non verticale.',
      'Mantieni i gomiti raccolti, non flarati.',
    ],
    bulkingTip:
      'Enfatizza la parte bassa del pettorale. Spesso permette più carico della panca piana. 3–4 serie da 6–10.',
  },

  // ───────── SHOULDERS ─────────
  'ohp': {
    name: 'Lento avanti con bilanciere',
    equipment: 'Bilanciere',
    cues: [
      'Bilanciere sulle clavicole, gomiti leggermente davanti alla barra.',
      'Stringi i glutei e l\'addome per evitare iperestensione lombare.',
      'Spingi verticalmente sopra la testa, poi sposta leggermente il busto in avanti a fine movimento.',
      'Scendi controllando fino alle clavicole, non oltre.',
    ],
    bulkingTip:
      'Il movimento composto principale per le spalle. Lavora pesante 5×5, oppure 8–10 ripetizioni per 3–4 serie.',
  },
  'seated-db-press': {
    name: 'Distensione con manubri da seduto',
    equipment: 'Manubri + panca verticale',
    cues: [
      'Schiena ben appoggiata, manubri sopra le spalle, palmi in avanti.',
      'Spingi verso l\'alto fino quasi a toccare i manubri sopra la testa.',
      'Scendi controllando fino all\'altezza delle orecchie.',
      'Non bloccare i gomiti in alto — mantieni la tensione sulle spalle.',
    ],
    bulkingTip:
      'Più sicuro per le spalle rispetto al bilanciere, e permette un po\' più di range. 3–4 serie da 8–12.',
  },
  'lateral-raise': {
    name: 'Alzate laterali con manubri',
    equipment: 'Manubri',
    cues: [
      'Inclina leggermente il busto in avanti, gomiti leggermente piegati.',
      'Solleva i manubri lateralmente fino all\'altezza delle spalle, guidando con i gomiti.',
      'Immagina di versare dell\'acqua da una brocca: il mignolo leggermente più alto del pollice.',
      'Scendi lentamente in 2 secondi. Non far cadere.',
    ],
    bulkingTip:
      'L\'esercizio chiave per le spalle laterali, fondamentale per l\'aspetto a "V" del busto. 4 serie da 12–20, vai vicino al cedimento.',
  },
  'cable-lateral': {
    name: 'Alzate laterali ai cavi',
    equipment: 'Cavo basso + maniglia',
    cues: [
      'Stai accanto alla macchina con il cavo che passa davanti al corpo.',
      'Solleva lateralmente fino all\'altezza della spalla, gomito appena piegato.',
      'La tensione del cavo è costante per tutto il movimento, a differenza dei manubri.',
      'Scendi controllando, mantenendo la tensione.',
    ],
    bulkingTip:
      'Tensione costante = stimolo eccellente per le spalle laterali. Spesso supera in efficacia i manubri. 3 serie da 12–15 per braccio.',
  },
  'rear-delt-fly': {
    name: 'Alzate posteriori con manubri',
    equipment: 'Manubri',
    cues: [
      'Inclinati in avanti da seduto o in piedi, busto quasi parallelo al pavimento.',
      'Solleva i manubri lateralmente con i gomiti leggermente piegati.',
      'Stringi le scapole nel punto alto, sentendo lavorare le spalle posteriori.',
      'Scendi controllando, senza dondolare.',
    ],
    bulkingTip:
      'Le spalle posteriori sono cruciali per la postura e l\'estetica del retro. 3–4 serie da 12–20, focus sulla connessione mente-muscolo.',
  },
  'face-pull': {
    name: 'Face pull ai cavi',
    equipment: 'Cavo alto + corda',
    cues: [
      'Imposta il cavo all\'altezza degli occhi, afferra la corda con presa neutra.',
      'Tira la corda verso il viso, allargando le mani e ruotando i pomi verso fuori.',
      'A fine movimento i gomiti devono essere alti, paralleli al pavimento.',
      'Stringi le scapole e i deltoidi posteriori per 1 secondo.',
    ],
    bulkingTip:
      'Bilancia tutto il lavoro di spinta. Salute delle spalle + crescita dei posteriori. 2–3 serie da 15–20 leggere, ogni allenamento.',
  },

  // ───────── BACK ─────────
  'deadlift': {
    name: 'Stacco da terra con bilanciere',
    equipment: 'Bilanciere',
    cues: [
      'Bilanciere sopra il centro del piede, tibie quasi a contatto con la barra.',
      'Schiena dritta neutra, scapole tirate indietro, petto in fuori.',
      'Spingi i piedi nel pavimento, alza il bilanciere mantenendolo a contatto con le gambe.',
      'A fine movimento sei dritto, glutei contratti, spalle indietro. Non iperestendere la schiena.',
    ],
    bulkingTip:
      'Movimento totale, principale per la catena posteriore. Lavora pesante 3–5 ripetizioni per 3 serie. Riposo lungo (3–5 minuti).',
  },
  'pullup': {
    name: 'Trazioni alla sbarra (presa prona)',
    equipment: 'Sbarra per trazioni',
    cues: [
      'Presa larga, palmi rivolti in avanti. Mani appena più larghe delle spalle.',
      'Inizia con le scapole — abbassale prima di piegare i gomiti.',
      'Tira il petto verso la sbarra, non solo il mento sopra.',
      'Scendi controllando in 2–3 secondi fino a braccia tese.',
    ],
    bulkingTip:
      'Il re degli esercizi per la larghezza della schiena. Se non riesci a fare almeno 5, usa la lat machine. 3–4 serie fino vicino al cedimento.',
  },
  'chin-up': {
    name: 'Trazioni presa supina (chin-up)',
    equipment: 'Sbarra per trazioni',
    cues: [
      'Presa stretta come le spalle, palmi rivolti verso di te.',
      'Tira il petto verso la sbarra, gomiti vicini al corpo.',
      'Stringi i bicipiti e i lat nel punto alto.',
      'Scendi lentamente fino a braccia tese.',
    ],
    bulkingTip:
      'Più focalizzato sui bicipiti rispetto alle trazioni prone. Eccellente per crescita di lat e bicipiti insieme. 3–4 serie da 6–10.',
  },
  'lat-pulldown': {
    name: 'Lat machine (presa larga)',
    equipment: 'Lat machine',
    cues: [
      'Siediti con le ginocchia bloccate sotto i rulli. Presa larga, palmi in avanti.',
      'Tira la barra al petto alto, non al collo, gomiti che scendono lungo i fianchi.',
      'Inclina leggermente il busto indietro, ma non dondolare.',
      'Scendi controllando in 2 secondi fino a braccia quasi tese.',
    ],
    bulkingTip:
      'Imita le trazioni con carico regolabile — perfetto per chi non riesce a farle a corpo libero o per volume aggiuntivo. 3–4 serie da 10–12.',
  },
  'barbell-row': {
    name: 'Rematore con bilanciere',
    equipment: 'Bilanciere',
    cues: [
      'Busto inclinato a circa 45°, schiena neutra, ginocchia leggermente piegate.',
      'Tira il bilanciere verso l\'ombelico, gomiti che scorrono lungo i fianchi.',
      'Stringi le scapole nel punto alto, sentendo lavorare lat e dorsali.',
      'Scendi controllando, mantenendo la posizione del busto.',
    ],
    bulkingTip:
      'Eccellente per spessore della schiena. Lavora pesante 5–8 ripetizioni per 3–4 serie. Forma sopra al peso.',
  },
  't-bar-row': {
    name: 'T-bar row',
    equipment: 'T-bar o landmine',
    cues: [
      'Stai sopra la barra, presa neutra con la maniglia, busto a 45°.',
      'Tira verso il petto, gomiti che vanno indietro e su.',
      'Stringi tutto a fine movimento — scapole, lat, dorsali.',
      'Scendi controllando senza rilasciare la tensione.',
    ],
    bulkingTip:
      'Variante del rematore più stabile e potente. Permette carichi pesanti. 3–4 serie da 8–10.',
  },
  'chest-supported-row': {
    name: 'Rematore con appoggio al petto',
    equipment: 'Panca inclinata + manubri',
    cues: [
      'Sdraiati a pancia in giù su una panca inclinata a 30–45°, manubri sotto.',
      'Tira i manubri verso i fianchi, gomiti che vanno indietro.',
      'Stringi le scapole nel punto alto.',
      'L\'appoggio elimina il dondolio — pura forza per la schiena.',
    ],
    bulkingTip:
      'Forse il miglior esercizio per la mid-back senza stressare la lombare. Ottimo per volume extra. 3 serie da 10–12.',
  },
  'seated-cable-row': {
    name: 'Pulley basso (rematore al cavo)',
    equipment: 'Cavo basso + maniglia stretta',
    cues: [
      'Siediti dritto, gambe leggermente piegate, piedi appoggiati.',
      'Tira la maniglia verso l\'addome basso, gomiti che scorrono lungo i fianchi.',
      'Petto fuori, scapole strette nel punto finale.',
      'Estendi le braccia controllando, sentendo lo stretch nei lat.',
    ],
    bulkingTip:
      'Tensione costante grazie al cavo. Perfetto per il volume extra dopo gli esercizi pesanti. 3 serie da 10–15.',
  },
  'straight-arm-pulldown': {
    name: 'Pulldown a braccia tese',
    equipment: 'Cavo alto + barra dritta',
    cues: [
      'Stai in piedi davanti al cavo, presa larga, leggera flessione del gomito.',
      'Tira la barra verso le cosce mantenendo le braccia quasi tese.',
      'L\'unico movimento è alla spalla — pensa di "spingere" la barra giù.',
      'Concentrati sulla contrazione dei dorsali a fine movimento.',
    ],
    bulkingTip:
      'Isolamento puro per i lat senza coinvolgere i bicipiti. Eccellente per la connessione mente-muscolo. 3 serie da 12–15.',
  },
  'db-pullover': {
    name: 'Pullover con manubrio',
    equipment: 'Manubrio + panca',
    cues: [
      'Sdraiati di traverso sulla panca, solo le spalle appoggiate, fianchi bassi.',
      'Tieni il manubrio sopra il petto con entrambe le mani.',
      'Abbassa il manubrio dietro la testa controllando lo stretch.',
      'Riporta sopra il petto usando i lat, non solo le braccia.',
    ],
    bulkingTip:
      'Classico esercizio per lo stretch dei lat e l\'espansione della gabbia toracica. 3 serie da 10–12 lente.',
  },

  // ───────── BICEPS ─────────
  'barbell-curl': {
    name: 'Curl con bilanciere',
    equipment: 'Bilanciere o bilanciere EZ',
    cues: [
      'In piedi, presa supina larga come le spalle, gomiti al fianco.',
      'Solleva il bilanciere ruotando l\'avambraccio, mantenendo i gomiti fermi.',
      'Stringi i bicipiti nel punto alto per 1 secondo.',
      'Scendi controllando in 2 secondi fino a braccia quasi tese.',
    ],
    bulkingTip:
      'Il movimento base per la massa dei bicipiti. 3–4 serie da 8–12. Lavora pesante ma con forma stretta.',
  },
  'incline-curl': {
    name: 'Curl su panca inclinata',
    equipment: 'Manubri + panca inclinata (~45°)',
    cues: [
      'Siediti su una panca inclinata a 45°, manubri ai lati, palmi in avanti.',
      'Lascia le braccia cadere indietro per uno stretch massimo del bicipite.',
      'Solleva i manubri senza muovere il gomito in avanti.',
      'Stringi forte in alto, poi scendi controllando.',
    ],
    bulkingTip:
      'Allunga il bicipite al massimo — fondamentale per lo sviluppo del capo lungo. 3 serie da 8–12.',
  },
  'hammer-curl': {
    name: 'Curl a martello (hammer curl)',
    equipment: 'Manubri',
    cues: [
      'Presa neutra, palmi che si guardano. Gomiti al fianco.',
      'Solleva alternati o insieme, senza ruotare i polsi.',
      'Stringi sopra mantenendo la posizione neutra.',
      'Scendi controllando.',
    ],
    bulkingTip:
      'Lavora il brachiale (sotto il bicipite) e il brachioradiale (avambraccio) — quei muscoli che danno spessore al braccio. 3 serie da 10–12.',
  },
  'preacher-curl': {
    name: 'Curl alla panca Scott',
    equipment: 'Bilanciere EZ + panca Scott',
    cues: [
      'Siediti con l\'ascella appoggiata al cuscino, braccia distese sopra di esso.',
      'Solleva il bilanciere controllando, mantenendo i gomiti fermi.',
      'Non andare a cedimento meccanico — fermati prima del lockout completo.',
      'Scendi lentamente sentendo lo stretch.',
    ],
    bulkingTip:
      'Isolamento puro: zero possibilità di barare con lo slancio. Perfetto per fine allenamento. 3 serie da 8–12.',
  },
  'cable-curl': {
    name: 'Curl ai cavi',
    equipment: 'Cavo basso + barra',
    cues: [
      'In piedi davanti alla puleggia bassa, presa supina, gomiti al fianco.',
      'Solleva la barra mantenendo i gomiti fermi.',
      'Tensione costante per tutto il movimento — il cavo non perde resistenza in basso.',
      'Scendi controllando.',
    ],
    bulkingTip:
      'Stimolo continuo del cavo. Variante eccellente al bilanciere libero. 3 serie da 10–15.',
  },
  'bayesian-curl': {
    name: 'Bayesian curl (cavi dietro al corpo)',
    equipment: 'Cavo basso + maniglia singola',
    cues: [
      'Stai davanti al cavo, ma con il braccio teso dietro al corpo.',
      'Tira la maniglia in avanti come un curl, mantenendo il gomito dietro al busto.',
      'L\'allungamento iniziale del bicipite è massimo in questa posizione.',
      'Stringi forte, poi scendi controllando.',
    ],
    bulkingTip:
      'Stiramento + tensione costante = stimolo eccellente per il capo lungo del bicipite. 3 serie da 10–12 per braccio.',
  },

  // ───────── TRICEPS ─────────
  'close-grip-bench': {
    name: 'Panca presa stretta',
    equipment: 'Bilanciere + panca',
    cues: [
      'Presa larga circa quanto le spalle, gomiti ben raccolti al fianco.',
      'Scendi lentamente al petto basso/sterno.',
      'Spingi su mantenendo i gomiti vicini al corpo.',
      'A differenza della panca normale, qui i tricipiti fanno la maggior parte del lavoro.',
    ],
    bulkingTip:
      'L\'unico esercizio composto pesante per i tricipiti. Permette carichi importanti. 3–4 serie da 6–10.',
  },
  'tricep-pushdown': {
    name: 'Push-down ai cavi',
    equipment: 'Cavo alto + corda o barra',
    cues: [
      'In piedi davanti alla puleggia alta, gomiti al fianco e fermi.',
      'Spingi verso il basso, tendendo completamente i gomiti.',
      'Apri leggermente la corda a fine movimento per una contrazione maggiore.',
      'Risali controllando, senza alzare i gomiti.',
    ],
    bulkingTip:
      'Lavoro principale per il capo laterale del tricipite (il "ferro di cavallo"). 3 serie da 12–15.',
  },
  'overhead-tricep-ext': {
    name: 'Estensioni tricipiti sopra la testa',
    equipment: 'Manubrio o corda al cavo',
    cues: [
      'Da seduto o in piedi, braccio sopra la testa, gomito vicino all\'orecchio.',
      'Piega il gomito portando il peso dietro la testa.',
      'Senti lo stretch nel tricipite, soprattutto nel capo lungo.',
      'Estendi completamente senza muovere il gomito.',
    ],
    bulkingTip:
      'Lo stretch sopra la testa attiva il capo lungo del tricipite — la parte che dà massa al braccio. 3 serie da 10–12.',
  },
  'skullcrusher': {
    name: 'French press (skullcrusher)',
    equipment: 'Bilanciere EZ + panca',
    cues: [
      'Sdraiato sulla panca, bilanciere sopra il petto, braccia tese.',
      'Piega solo i gomiti — porta il bilanciere verso la fronte o oltre.',
      'I gomiti restano fissi puntati al soffitto.',
      'Estendi completamente, stringendo i tricipiti.',
    ],
    bulkingTip:
      'Classico esercizio per il volume dei tricipiti. Attenzione ai gomiti: forma pulita. 3 serie da 10–12.',
  },

  // ───────── LEGS ─────────
  'back-squat': {
    name: 'Squat con bilanciere (high-bar)',
    equipment: 'Bilanciere',
    cues: [
      'Bilanciere alto sui trapezi, presa stretta.',
      'Piedi a larghezza spalle, punte leggermente verso fuori.',
      'Scendi controllando, ginocchia in linea con le punte, fino a femori paralleli o sotto.',
      'Spingi i piedi nel pavimento per risalire, mantenendo il petto in alto.',
    ],
    bulkingTip:
      'Il re degli esercizi per le gambe. 3–5 serie da 5–8 con carico pesante. Riposo lungo (3+ minuti).',
  },
  'front-squat': {
    name: 'Front squat',
    equipment: 'Bilanciere',
    cues: [
      'Bilanciere sulle clavicole, gomiti alti paralleli al pavimento.',
      'Schiena verticale durante tutto il movimento, busto in linea.',
      'Scendi profondamente — i gomiti devono restare alti.',
      'Risali mantenendo il petto in fuori.',
    ],
    bulkingTip:
      'Più focalizzato sui quadricipiti e meno sui glutei rispetto al back squat. 3–4 serie da 6–8.',
  },
  'leg-press': {
    name: 'Pressa orizzontale o a 45°',
    equipment: 'Macchina pressa',
    cues: [
      'Piedi a larghezza spalle al centro della piattaforma.',
      'Scendi controllando, ginocchia che vanno verso il petto, senza staccare la lombare.',
      'Spingi tornando in alto, senza bloccare le ginocchia completamente.',
      'Mantieni la schiena bassa appoggiata.',
    ],
    bulkingTip:
      'Carico pesante in sicurezza per i quadricipiti. Ottima per volume extra dopo lo squat. 3–4 serie da 8–12.',
  },
  'hack-squat': {
    name: 'Hack squat',
    equipment: 'Macchina hack squat',
    cues: [
      'Schiena appoggiata, piedi al centro della piattaforma.',
      'Scendi profondamente, ginocchia in linea con le punte.',
      'Spingi i piedi per risalire, mantenendo il contatto con lo schienale.',
      'Posizione dei piedi più alta = più glutei e femorali. Più bassa = più quadricipiti.',
    ],
    bulkingTip:
      'Eccellente per i quadricipiti senza stressare la schiena. 3–4 serie da 8–12.',
  },
  'leg-extension': {
    name: 'Leg extension',
    equipment: 'Macchina leg extension',
    cues: [
      'Siediti con la schiena appoggiata, rulli sopra le caviglie.',
      'Estendi completamente le ginocchia, stringendo i quadricipiti in alto per 1 secondo.',
      'Scendi controllando in 2 secondi.',
      'Non far sbattere i pesi.',
    ],
    bulkingTip:
      'Isolamento puro per i quadricipiti, soprattutto il vasto mediale (la "goccia" sopra il ginocchio). 3 serie da 12–15.',
  },
  'walking-lunge': {
    name: 'Affondi camminati',
    equipment: 'Manubri o bilanciere',
    cues: [
      'Fai un passo lungo in avanti, scendendo finché il ginocchio posteriore quasi tocca il pavimento.',
      'Ginocchio anteriore in linea con la caviglia, busto eretto.',
      'Spingi con il tallone anteriore per portare avanti l\'altra gamba.',
      'Mantieni il ritmo controllato e l\'equilibrio.',
    ],
    bulkingTip:
      'Lavoro unilaterale eccellente per equilibrio muscolare. Coinvolge tutto: quadricipiti, glutei, femorali, core. 3 serie da 10–12 passi per gamba.',
  },
  'split-squat': {
    name: 'Bulgarian split squat',
    equipment: 'Manubri + panca',
    cues: [
      'Piede posteriore appoggiato sulla panca, piede anteriore avanti.',
      'Scendi piegando solo il ginocchio anteriore, busto leggermente in avanti.',
      'Ginocchio anteriore in linea con la caviglia, non oltre la punta.',
      'Spingi con il tallone per risalire.',
    ],
    bulkingTip:
      'Forse il miglior esercizio unilaterale per le gambe. Bruciante. 3 serie da 8–10 per gamba.',
  },
  'rdl': {
    name: 'Stacco rumeno (RDL)',
    equipment: 'Bilanciere',
    cues: [
      'In piedi con il bilanciere all\'altezza delle anche, ginocchia leggermente piegate.',
      'Piega le anche indietro, mantenendo la schiena dritta e le ginocchia ferme.',
      'Scendi finché senti lo stretch nei femorali (di solito sotto le ginocchia).',
      'Risali contraendo glutei e femorali, riportando il bilanciere alle anche.',
    ],
    bulkingTip:
      'Il miglior esercizio composto per femorali e glutei. 3–4 serie da 6–10. Forma sopra al peso.',
  },
  'leg-curl': {
    name: 'Leg curl in piedi o sdraiato',
    equipment: 'Macchina leg curl',
    cues: [
      'Posiziona i rulli sopra i tendini d\'Achille (non sui polpacci).',
      'Piega le ginocchia portando i talloni verso i glutei.',
      'Stringi i femorali in alto per 1 secondo.',
      'Estendi controllando in 2 secondi.',
    ],
    bulkingTip:
      'Isolamento essenziale per i femorali. Spesso trascurato. 3 serie da 10–12.',
  },
  'seated-leg-curl': {
    name: 'Leg curl da seduto',
    equipment: 'Macchina leg curl seduta',
    cues: [
      'Siediti con la schiena appoggiata, gambe estese davanti, rulli sopra le caviglie.',
      'Piega le ginocchia portando i talloni sotto il sedile.',
      'Stringi i femorali, pausa di 1 secondo in basso.',
      'Estendi controllando.',
    ],
    bulkingTip:
      'La versione seduta dà più stretch ai femorali rispetto a quella sdraiata — superiore per crescita. 3 serie da 10–12.',
  },
  'hip-thrust': {
    name: 'Hip thrust con bilanciere',
    equipment: 'Bilanciere + panca',
    cues: [
      'Appoggia le scapole sulla panca, bilanciere sui fianchi (usa un cuscino).',
      'Piedi a terra, ginocchia piegate a 90° a fine movimento.',
      'Spingi i fianchi in alto stringendo i glutei al massimo.',
      'Scendi controllando, mantenendo la tensione.',
    ],
    bulkingTip:
      'L\'esercizio più efficace per i glutei. 3–4 serie da 8–12 con carico significativo.',
  },
  'cable-pull-through': {
    name: 'Pull-through ai cavi',
    equipment: 'Cavo basso + corda',
    cues: [
      'Stai dando le spalle alla puleggia, corda tra le gambe.',
      'Piega le anche indietro mantenendo la schiena dritta.',
      'Risali contraendo glutei e femorali, spingendo i fianchi in avanti.',
      'Movimento controllato, no slancio.',
    ],
    bulkingTip:
      'Allenamento di hinge senza carico assiale sulla colonna — perfetto come accessorio o per recuperare dallo stacco. 3 serie da 12–15.',
  },
  'good-morning': {
    name: 'Good morning',
    equipment: 'Bilanciere',
    cues: [
      'Bilanciere sui trapezi come per lo squat, ginocchia leggermente piegate.',
      'Piega le anche indietro, busto che scende in avanti.',
      'Schiena rigidamente dritta per tutta la discesa.',
      'Risali contraendo femorali e glutei.',
    ],
    bulkingTip:
      'Eccellente per la catena posteriore. Usa pesi moderati con forma perfetta. 3 serie da 8–10.',
  },
  'standing-calf-raise': {
    name: 'Calf raise in piedi',
    equipment: 'Macchina o multipower',
    cues: [
      'Avampiede sul gradino, talloni che possono scendere sotto.',
      'Scendi controllando per uno stretch profondo del polpaccio.',
      'Sali completamente sulla punta, contraendo per 1 secondo in alto.',
      'Movimento lento e controllato — niente slancio.',
    ],
    bulkingTip:
      'I polpacci rispondono a volume alto e tensione lunga. 4 serie da 10–15 con pause in alto e in basso.',
  },
  'seated-calf-raise': {
    name: 'Calf raise da seduto',
    equipment: 'Macchina calf seduta',
    cues: [
      'Siediti con i cuscini sopra le ginocchia, avampiede sul gradino.',
      'Scendi profondamente per allungare il soleo.',
      'Sali sulla punta, contrazione di 1 secondo.',
      'Movimento isolato lento.',
    ],
    bulkingTip:
      'Lavora principalmente il soleo (sotto al gastrocnemio). Insieme al calf in piedi crei polpacci completi. 3 serie da 12–15.',
  },

  // ───────── CORE ─────────
  'hanging-leg-raise': {
    name: 'Sollevamento gambe alla sbarra',
    equipment: 'Sbarra per trazioni',
    cues: [
      'Appeso alla sbarra, presa larga come le spalle.',
      'Solleva le gambe tese verso l\'alto, sollevando anche le anche (non solo le gambe).',
      'Pausa in alto per 1 secondo.',
      'Scendi controllando, senza dondolare.',
    ],
    bulkingTip:
      'Il miglior esercizio per l\'addome inferiore e basso. Se troppo difficile, parti con ginocchia piegate. 3 serie da 8–12.',
  },
  'cable-crunch': {
    name: 'Crunch ai cavi',
    equipment: 'Cavo alto + corda',
    cues: [
      'In ginocchio davanti al cavo, corda dietro la testa.',
      'Piega il busto verso il pavimento contraendo l\'addome.',
      'Il movimento è una flessione del tronco — non un piegamento alle anche.',
      'Stringi forte in basso, poi torna su lentamente.',
    ],
    bulkingTip:
      'Permette di caricare l\'addome con carico progressivo (come qualsiasi muscolo). 3 serie da 12–15 con tensione massima.',
  },
  'plank': {
    name: 'Plank',
    equipment: 'Corpo libero',
    cues: [
      'Appoggia avambracci e punte dei piedi a terra, corpo in linea.',
      'Stringi addome, glutei e quadricipiti.',
      'Non lasciare cadere le anche né alzarle troppo.',
      'Respira normalmente, mantieni la posizione.',
    ],
    bulkingTip:
      'Stabilità del core, non massa. Utile come riscaldamento o finisher. 3 serie da 30–60 secondi.',
  },

  // ───────── TRAPS / FOREARMS ─────────
  'db-shrug': {
    name: 'Scrollate con manubri',
    equipment: 'Manubri',
    cues: [
      'In piedi con i manubri ai lati, braccia tese.',
      'Solleva le spalle verso le orecchie il più possibile.',
      'Pausa in alto per 1 secondo, stringendo i trapezi.',
      'Scendi controllando in 2 secondi.',
    ],
    bulkingTip:
      'Movimento semplice ma efficace per i trapezi alti. 3 serie da 12–15 con tensione totale.',
  },
  'reverse-curl': {
    name: 'Curl inverso (presa prona)',
    equipment: 'Bilanciere EZ',
    cues: [
      'Presa prona (palmi verso il basso), larghezza spalle.',
      'Solleva il bilanciere mantenendo i polsi dritti, gomiti al fianco.',
      'Stringi gli avambracci in alto.',
      'Scendi controllando.',
    ],
    bulkingTip:
      'Costruisce il brachioradiale e gli estensori dell\'avambraccio — spessore "esterno" del braccio. 3 serie da 10–12.',
  },
  'wrist-curl': {
    name: 'Curl per polsi',
    equipment: 'Manubri o bilanciere',
    cues: [
      'Siediti con gli avambracci appoggiati sulle cosce, palmi verso l\'alto.',
      'Lascia cadere il peso fino in fondo, allungando l\'avambraccio.',
      'Arrotola il polso verso l\'alto per la massima contrazione.',
      'Movimento solo dal polso, niente avambraccio.',
    ],
    bulkingTip:
      'Avambracci forti = presa più solida in tutti gli altri esercizi. 3 serie da 15–20 leggere.',
  },
}
