/**
 * Backend log message i18n (EN/AR).
 * Used when sending game logs to the frontend; message is translated per socket lang.
 */

export type LogLang = 'en' | 'ar'

const EN: Record<string, string> = {
  join: '"{{nickname}}" joined the game',
  leave: '"{{nickname}}" left the game',
  leaveHostCancel: '"{{nickname}}" (host) left the game. Game cancelled.',
  gameStarted:
    'Game started! Roles have been assigned. {{mafiaCount}} Mafia, {{doctorCount}} Doctor, {{villagerCount}} Villagers.',
  day1Begins: 'Day 1 begins. Discuss and vote to lynch a suspect.',
  dayBegins: 'Day {{dayNumber}} begins. Discuss and vote to lynch a suspect.',
  nightBegins:
    'Night {{nightNumber}} begins. Mafia, choose your target. Doctor, choose who to heal.',
  villagersWin: '🎉 Villagers win! All mafia have been eliminated.',
  mafiaWinsControl: '🎉 Mafia wins! They control the town.',
  mafiaWinsNoOne: '🎉 Mafia wins! No one can stop them anymore.',
  mafiaWinsTonight:
    "🎉 Mafia wins! They will eliminate the remaining villagers tonight.",
  nightNoTarget: 'Night ends. No one was targeted by the mafia.',
  dayNoLynch: 'Day ends. No one was lynched.',
  heal: 'The doctor saved "{{nickname}}" from the mafia\'s attack!',

  'mafiaKill.0':
    '🔫 [Mafia Kill] "{{nickname}}" vanished after a short conversation behind closed doors. 🚪',
  'mafiaKill.1':
    '🔫 [Mafia Kill] "{{nickname}}" signed a contract they definitely didn\'t read. 📝💀',
  'mafiaKill.2':
    '🔫 [Mafia Kill] "{{nickname}}" was promoted to an example for others. 📉',
  'mafiaKill.3':
    "🔫 [Mafia Kill] \"{{nickname}}\" misunderstood what 'family meeting' meant. 👨‍👩‍👧‍👦",
  'mafiaKill.4':
    '🔫 [Mafia Kill] "{{nickname}}" is now part of an ongoing investigation. 🕵️‍♂️',
  'mafiaKill.5':
    '🔫 [Mafia Kill] "{{nickname}}" missed the memo about staying quiet. 🤐',
  'mafiaKill.6':
    '🔫 [Mafia Kill] "{{nickname}}" won the argument. Lost everything else. 🥀',
  'mafiaKill.7':
    '🔫 [Mafia Kill] "{{nickname}}" was removed from the payroll. Permanently. 💼',
  'mafiaKill.8':
    '🔫 [Mafia Kill] "{{nickname}}" learned too much, too fast. 🧠',
  'mafiaKill.9':
    '🔫 [Mafia Kill] "{{nickname}}" took responsibility. The mafia took care of the rest. 🪦',
  'mafiaKill.10':
    "🔫 [Mafia Kill] \"{{nickname}}\" won't be causing any more problems. ✔️",
  'mafiaKill.11':
    '🔫 [Mafia Kill] "{{nickname}}" is no longer accepting messages. 📵',
  'mafiaKill.12':
    '🔫 [Mafia Kill] "{{nickname}}" reached the end of their character arc. 🎭',
  'mafiaKill.13':
    '🔫 [Mafia Kill] "{{nickname}}" was last seen nodding nervously. Then silence. 😶',
  'mafiaKill.14':
    '🔫 [Mafia Kill] "{{nickname}}" failed the loyalty test. ❌',
  'mafiaKill.15':
    '🔫 [Mafia Kill] "{{nickname}}" got edited out of the story. ✂️',
  'mafiaKill.16':
    '🔫 [Mafia Kill] "{{nickname}}" found out why we don\'t ask twice. 🔫',
  'mafiaKill.17':
    '🔫 [Mafia Kill] "{{nickname}}" is now a cautionary tale. 📖',
  'mafiaKill.18':
    '🔫 [Mafia Kill] "{{nickname}}" took a shortcut. It was final. 🛣️',
  'mafiaKill.19':
    '🔫 [Mafia Kill] "{{nickname}}" has been dealt with. 🧤',

  'lynchVillager.0':
    '⚖️ [Lynched] "{{nickname}}" was innocent. The village will pretend this never happened. 😬',
  'lynchVillager.1':
    '⚖️ [Lynched] "{{nickname}}" was NOT the mafia. Awkward silence follows… 😶',
  'lynchVillager.2':
    '⚖️ [Lynched] "{{nickname}}" died for democracy. Democracy feels bad now. 🗳️💀',
  'lynchVillager.3':
    '⚖️ [Lynched] "{{nickname}}" was just vibing. The villagers chose violence. 😐',
  'lynchVillager.4':
    '⚖️ [Lynched] "{{nickname}}" trusted the process. That was the mistake. 🤡',
  'lynchVillager.5': '⚖️ [Lynched] "{{nickname}}" wasn\'t the mafia. Whoops. 😅',
  'lynchVillager.6':
    '⚖️ [Lynched] "{{nickname}}" learned the village has trust issues. 🚩',
  'lynchVillager.7':
    '⚖️ [Lynched] "{{nickname}}" was sacrificed to poor logic and loud voices. 📉',
  'lynchVillager.8':
    '⚖️ [Lynched] "{{nickname}}" got voted out by vibes alone. 🎭',
  'lynchVillager.9':
    '⚖️ [Lynched] "{{nickname}}" was the wrong choice. The mafia approves. 👏',
  'lynchVillager.10':
    '⚖️ [Lynched] "{{nickname}}" died so everyone could say "my bad" tomorrow. 🙃',
  'lynchVillager.11':
    '⚖️ [Lynched] "{{nickname}}" was innocent. The village has regrets. Briefly. 😔',
  'lynchVillager.12':
    '⚖️ [Lynched] "{{nickname}}" trusted their neighbors. Big mistake. 🏘️',
  'lynchVillager.13':
    '⚖️ [Lynched] "{{nickname}}" got caught in the classic villagers L. 📉',
  'lynchVillager.14':
    '⚖️ [Lynched] "{{nickname}}" was the wrong answer. Final answer. ❌',
  'lynchVillager.15':
    '⚖️ [Lynched] "{{nickname}}" paid the price for bad group chat decisions. 📱',
  'lynchVillager.16':
    '⚖️ [Lynched] "{{nickname}}" wasn\'t suspicious. Just unlucky. 🍀',
  'lynchVillager.17':
    '⚖️ [Lynched] "{{nickname}}" died to prove the mafia didn\'t even need to try. 😈',

  'lynchMafia.0':
    '⚖️ [Lynched] "{{nickname}}" was exposed! The mafia\'s plan crumbles. 🎯',
  'lynchMafia.1':
    '⚖️ [Lynched] "{{nickname}}" got caught red-handed. Justice served! ⚖️',
  'lynchMafia.2':
    "⚖️ [Lynched] \"{{nickname}}\" thought they were slick. The village wasn't having it. 😎",
  'lynchMafia.3':
    '⚖️ [Lynched] "{{nickname}}" tried to blend in. Failed spectacularly. 🎭',
  'lynchMafia.4':
    '⚖️ [Lynched] "{{nickname}}" was the mafia! The villagers got it right this time. ✅',
  'lynchMafia.5':
    '⚖️ [Lynched] "{{nickname}}" got outsmarted by the village. Skill issue. 🧠',
  'lynchMafia.6':
    '⚖️ [Lynched] "{{nickname}}" was too sus. The village had enough. 🚨',
  'lynchMafia.7':
    '⚖️ [Lynched] "{{nickname}}" made one mistake too many. Game over. 🎮',
  'lynchMafia.8':
    '⚖️ [Lynched] "{{nickname}}" was the mafia all along! The village celebrates. 🎉',
  'lynchMafia.9':
    "⚖️ [Lynched] \"{{nickname}}\" got caught. The mafia's numbers are dwindling. 📉",
  'lynchMafia.10':
    '⚖️ [Lynched] "{{nickname}}" slipped up. The village caught them. 🕵️',
  'lynchMafia.11':
    '⚖️ [Lynched] "{{nickname}}" was playing both sides. The village chose a side. ⚔️',
  'lynchMafia.12':
    '⚖️ [Lynched] "{{nickname}}" thought they were safe. They were wrong. ❌',
  'lynchMafia.13':
    '⚖️ [Lynched] "{{nickname}}" got voted out for being too obvious. Oops. 😬',
  'lynchMafia.14':
    "⚖️ [Lynched] \"{{nickname}}\" was the mafia! The village's detective work paid off. 🔍",

  'lynchDoctor.0':
    "⚖️ [Lynched] \"{{nickname}}\" was the doctor! The village just lost their only protection. 😱",
  'lynchDoctor.1':
    '⚖️ [Lynched] "{{nickname}}" was trying to save lives. The village didn\'t care. 💔',
  'lynchDoctor.2':
    "⚖️ [Lynched] \"{{nickname}}\" was the doctor! Who's going to save you now? 🏥",
  'lynchDoctor.3':
    '⚖️ [Lynched] "{{nickname}}" was healing people. The village lynched their healer. 🤦',
  'lynchDoctor.4':
    '⚖️ [Lynched] "{{nickname}}" was the doctor! The mafia is celebrating. 🎉',
  'lynchDoctor.5':
    '⚖️ [Lynched] "{{nickname}}" saved lives every night. The village killed them anyway. 😢',
  'lynchDoctor.6':
    "⚖️ [Lynched] \"{{nickname}}\" was the doctor! This is why we can't have nice things. 😤",
  'lynchDoctor.7':
    '⚖️ [Lynched] "{{nickname}}" was protecting the innocent. The village didn\'t notice. 🛡️',
  'lynchDoctor.8':
    "⚖️ [Lynched] \"{{nickname}}\" was the doctor! The village just made the mafia's job easier. 😈",
  'lynchDoctor.9':
    '⚖️ [Lynched] "{{nickname}}" was healing people. The village chose violence instead. ⚔️',
  'lynchDoctor.10':
    '⚖️ [Lynched] "{{nickname}}" was the doctor! The village has no one to blame but themselves. 🤷',
  'lynchDoctor.11':
    '⚖️ [Lynched] "{{nickname}}" was saving lives. The village voted to end theirs. 💉',
  'lynchDoctor.12':
    '⚖️ [Lynched] "{{nickname}}" was the doctor! The mafia sends their thanks. 🙏',
  'lynchDoctor.13':
    "⚖️ [Lynched] \"{{nickname}}\" was the village's only hope. Now it's gone. 🌑",
  'lynchDoctor.14':
    '⚖️ [Lynched] "{{nickname}}" was the doctor! The village just threw away their lifeline. 🚑',
}

const AR: Record<string, string> = {
  join: 'انضم "{{nickname}}" إلى اللعبة',
  leave: 'غادر "{{nickname}}" اللعبة',
  leaveHostCancel: 'غادر "{{nickname}}" (المضيف) اللعبة. تم إلغاء اللعبة.',
  gameStarted:
    'بدأت اللعبة! تم توزيع الأدوار. {{mafiaCount}} مافيا، {{doctorCount}} طبيب، {{villagerCount}} قرويون.',
  day1Begins: 'بدء اليوم ١. ناقشوا وصوّتوا لإعدام مشتبه به.',
  dayBegins: 'بدء اليوم {{dayNumber}}. ناقشوا وصوّتوا لإعدام مشتبه به.',
  nightBegins:
    'بدء الليل {{nightNumber}}. أيها المافيا، اختاروا الهدف. أيها الطبيب، اختر من تنقذ.',
  villagersWin: '🎉 فاز القرويون! تم القضاء على المافيا.',
  mafiaWinsControl: '🎉 فازت المافيا! تسيطر على البلدة.',
  mafiaWinsNoOne: '🎉 فازت المافيا! لا أحد يقدر يوقفهم.',
  mafiaWinsTonight:
    '🎉 فازت المافيا! سيقضون على القرويين المتبقين الليلة.',
  nightNoTarget: 'انتهى الليل. لم يُستهدف أحد من المافيا.',
  dayNoLynch: 'انتهى النهار. لم يُعدَم أحد.',
  heal: 'أنقذ الطبيب "{{nickname}}" من هجوم المافيا!',

  'mafiaKill.0':
    '🔫 [قتل مافيا] اختفى "{{nickname}}" بعد محادثة قصيرة خلف الأبواب المغلقة. 🚪',
  'mafiaKill.1':
    '🔫 [قتل مافيا] وقّع "{{nickname}}" عقداً ما قرأه. 📝💀',
  'mafiaKill.2':
    '🔫 [قتل مافيا] رُقّي "{{nickname}}" ليكون عبرة للآخرين. 📉',
  'mafiaKill.3':
    '🔫 [قتل مافيا] أساء "{{nickname}}" فهم "اجتماع العائلة". 👨‍👩‍👧‍👦',
  'mafiaKill.4':
    '🔫 [قتل مافيا] أصبح "{{nickname}}" جزءاً من تحقيق جارٍ. 🕵️‍♂️',
  'mafiaKill.5':
    '🔫 [قتل مافيا] فات "{{nickname}}" مذكرة "ابقَ صامتاً". 🤐',
  'mafiaKill.6':
    '🔫 [قتل مافيا] ربح "{{nickname}}" الجدال. وخسر كل شيء. 🥀',
  'mafiaKill.7':
    '🔫 [قتل مافيا] أُسقط "{{nickname}}" من الرواتب. نهائياً. 💼',
  'mafiaKill.8':
    '🔫 [قتل مافيا] تعلّم "{{nickname}}" كثيراً وبسرعة. 🧠',
  'mafiaKill.9':
    '🔫 [قتل مافيا] تحمّل "{{nickname}}" المسؤولية. المافيا تكفّلت بالباقي. 🪦',
  'mafiaKill.10':
    '🔫 [قتل مافيا] لن يسبب "{{nickname}}" مزيداً من المشاكل. ✔️',
  'mafiaKill.11':
    '🔫 [قتل مافيا] "{{nickname}}" لم يعد يقبل الرسائل. 📵',
  'mafiaKill.12':
    '🔫 [قتل مافيا] وصل "{{nickname}}" لنهاية قوسه. 🎭',
  'mafiaKill.13':
    '🔫 [قتل مافيا] آخر ما رُؤي "{{nickname}}" يُومئ بعصبية. ثم صمت. 😶',
  'mafiaKill.14':
    '🔫 [قتل مافيا] رسب "{{nickname}}" في اختبار الولاء. ❌',
  'mafiaKill.15':
    '🔫 [قتل مافيا] حُذف "{{nickname}}" من القصة. ✂️',
  'mafiaKill.16':
    '🔫 [قتل مافيا] اكتشف "{{nickname}}" لماذا لا نطلب مرّتين. 🔫',
  'mafiaKill.17':
    '🔫 [قتل مافيا] "{{nickname}}" أصبح عبرة. 📖',
  'mafiaKill.18':
    '🔫 [قتل مافيا] أخذ "{{nickname}}" اختصاراً. وكان نهائياً. 🛣️',
  'mafiaKill.19':
    '🔫 [قتل مافيا] تم التعامل مع "{{nickname}}". 🧤',

  'lynchVillager.0':
    '⚖️ [إعدام] كان "{{nickname}}" بريئاً. القرية تتظاهر أن شيئاً لم يحدث. 😬',
  'lynchVillager.1':
    '⚖️ [إعدام] "{{nickname}}" لم يكن من المافيا. صمت محرج. 😶',
  'lynchVillager.2':
    '⚖️ [إعدام] مات "{{nickname}}" من أجل الديمقراطية. والديمقراطية تشعر بالسوء الآن. 🗳️💀',
  'lynchVillager.3':
    '⚖️ [إعدام] كان "{{nickname}}" مسترخياً. القرويون اختاروا العنف. 😐',
  'lynchVillager.4':
    '⚖️ [إعدام] وثق "{{nickname}}" بالعملية. ذلك كان الخطأ. 🤡',
  'lynchVillager.5':
    '⚖️ [إعدام] "{{nickname}}" لم يكن من المافيا. عذراً. 😅',
  'lynchVillager.6':
    '⚖️ [إعدام] اكتشف "{{nickname}}" أن القرية لا تثق. 🚩',
  'lynchVillager.7':
    '⚖️ [إعدام] ضُحّي بـ "{{nickname}}" للفوضى والأصوات العالية. 📉',
  'lynchVillager.8':
    '⚖️ [إعدام] أُقصي "{{nickname}}" بالمشاعر فقط. 🎭',
  'lynchVillager.9':
    '⚖️ [إعدام] "{{nickname}}" كان الخيار الخاطئ. المافيا راضية. 👏',
  'lynchVillager.10':
    '⚖️ [إعدام] مات "{{nickname}}" ليقول الجميع "عذراً" غداً. 🙃',
  'lynchVillager.11':
    '⚖️ [إعدام] كان "{{nickname}}" بريئاً. القرية نادمة. لفترة. 😔',
  'lynchVillager.12':
    '⚖️ [إعدام] وثق "{{nickname}}" بجيرانه. خطأ فادح. 🏘️',
  'lynchVillager.13':
    '⚖️ [إعدام] وقع "{{nickname}}" في فخ القرويين الكلاسيكي. 📉',
  'lynchVillager.14':
    '⚖️ [إعدام] "{{nickname}}" كان الجواب الخاطئ. جواب نهائي. ❌',
  'lynchVillager.15':
    '⚖️ [إعدام] دفع "{{nickname}}" ثمن قرارات الشات السيئة. 📱',
  'lynchVillager.16':
    '⚖️ [إعدام] "{{nickname}}" لم يكن مشبوهاً. فقط غير محظوظ. 🍀',
  'lynchVillager.17':
    '⚖️ [إعدام] مات "{{nickname}}" ليثبت أن المافيا لم تحتج حتى المحاولة. 😈',

  'lynchMafia.0':
    '⚖️ [إعدام] انكشف "{{nickname}}"! خطة المافيا تتداعى. 🎯',
  'lynchMafia.1':
    '⚖️ [إعدام] أُمسك "{{nickname}}" متلبساً. نُفذت العدالة! ⚖️',
  'lynchMafia.2':
    '⚖️ [إعدام] ظن "{{nickname}}" أنه ذكي. القرية لم تقبل. 😎',
  'lynchMafia.3':
    '⚖️ [إعدام] حاول "{{nickname}}" الاندماج. فشل بشكل مذهل. 🎭',
  'lynchMafia.4':
    '⚖️ [إعدام] "{{nickname}}" كان المافيا! أصاب القرويون هذه المرة. ✅',
  'lynchMafia.5':
    '⚖️ [إعدام] تفوّقت القرية على "{{nickname}}". مشكلة مهارة. 🧠',
  'lynchMafia.6':
    '⚖️ [إعدام] كان "{{nickname}}" مشبوهاً جداً. اكتفت القرية. 🚨',
  'lynchMafia.7':
    '⚖️ [إعدام] أخطأ "{{nickname}}" مرة أكثر من اللازم. انتهت اللعبة. 🎮',
  'lynchMafia.8':
    '⚖️ [إعدام] "{{nickname}}" كان المافيا طوال الوقت! القرية تحتفل. 🎉',
  'lynchMafia.9':
    '⚖️ [إعدام] أُمسك "{{nickname}}". أعداد المافيا تتناقص. 📉',
  'lynchMafia.10':
    '⚖️ [إعدام] زلّ "{{nickname}}". أمسكت به القرية. 🕵️',
  'lynchMafia.11':
    '⚖️ [إعدام] لعب "{{nickname}}" على الجانبين. القرية اختارت جانباً. ⚔️',
  'lynchMafia.12':
    '⚖️ [إعدام] ظن "{{nickname}}" أنه في أمان. كان مخطئاً. ❌',
  'lynchMafia.13':
    '⚖️ [إعدام] أُقصي "{{nickname}}" لكونه واضحاً جداً. عذراً. 😬',
  'lynchMafia.14':
    '⚖️ [إعدام] "{{nickname}}" كان المافيا! تحري القرية أتى ثماره. 🔍',

  'lynchDoctor.0':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! خسرت القرية حمايتهم الوحيدة. 😱',
  'lynchDoctor.1':
    '⚖️ [إعدام] كان "{{nickname}}" يحاول إنقاذ الأرواح. القرية لم تهتم. 💔',
  'lynchDoctor.2':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! من سينقذكم الآن؟ 🏥',
  'lynchDoctor.3':
    '⚖️ [إعدام] كان "{{nickname}}" يُعالج الناس. أعدمت القرية طبيبها. 🤦',
  'lynchDoctor.4':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! المافيا تحتفل. 🎉',
  'lynchDoctor.5':
    '⚖️ [إعدام] أنقذ "{{nickname}}" أرواحاً كل ليلة. القرية قتلته رغم ذلك. 😢',
  'lynchDoctor.6':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! لهذا لا نستحق الأشياء الجميلة. 😤',
  'lynchDoctor.7':
    '⚖️ [إعدام] كان "{{nickname}}" يحمي الأبرياء. القرية لم تلحظ. 🛡️',
  'lynchDoctor.8':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! سهّلت القرية عمل المافيا. 😈',
  'lynchDoctor.9':
    '⚖️ [إعدام] كان "{{nickname}}" يُعالج. القرية اختارت العنف. ⚔️',
  'lynchDoctor.10':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! لا يلوم القرية إلا نفسها. 🤷',
  'lynchDoctor.11':
    '⚖️ [إعدام] كان "{{nickname}}" ينقذ أرواحاً. صوّتت القرية لإنهاء حياته. 💉',
  'lynchDoctor.12':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! المافيا تشكر. 🙏',
  'lynchDoctor.13':
    '⚖️ [إعدام] "{{nickname}}" كان أمل القرية الوحيد. انتهى. 🌑',
  'lynchDoctor.14':
    '⚖️ [إعدام] "{{nickname}}" كان الطبيب! ألقى القرويون شريان حياتهم. 🚑',
}

const MAP: Record<LogLang, Record<string, string>> = { en: EN, ar: AR }

function interpolate(template: string, params: Record<string, string | number>): string {
  let out = template
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
  }
  return out
}

export interface GameLogForTranslate {
  id: string
  message: string
  timestamp: Date
  type?: string
  logKey?: string
  logParams?: Record<string, string | number>
}

/**
 * Translate a game log message for the given language.
 * Uses logKey + logParams when present; otherwise returns log.message (English).
 */
export function translateLog(
  log: GameLogForTranslate,
  lang: LogLang
): string {
  const key = log.logKey
  const params = log.logParams ?? {}
  const dict = MAP[lang] ?? MAP.en
  const template = key ? dict[key] : null
  if (template) {
    return interpolate(template, params)
  }
  return log.message
}

/** Normalize client lang to LogLang ('en' | 'ar'). */
export function normalizeLogLang(lang?: string): LogLang {
  return lang?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}
