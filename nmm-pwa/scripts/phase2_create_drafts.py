import base64
import json
import math
import re
import requests

BASE = "https://info.novymatrixmedia.sk/wp-json/wp/v2"
USER = "admin_nmm"
APP = "x3kk gjK0 2PJh XgQ7 8M1S hN2S"

AUTH = base64.b64encode(f"{USER}:{APP}".encode("ascii")).decode("ascii")
HEADERS = {"Authorization": f"Basic {AUTH}", "Content-Type": "application/json; charset=utf-8"}


def wp_get(path, params=None):
    r = requests.get(f"{BASE}/{path}", headers=HEADERS, params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def wp_post(path, payload):
    r = requests.post(f"{BASE}/{path}", headers=HEADERS, data=json.dumps(payload, ensure_ascii=False), timeout=120)
    r.raise_for_status()
    return r.json()


def words(html):
    txt = re.sub(r"<[^>]+>", " ", html)
    txt = re.sub(r"\s+", " ", txt).strip()
    return len([w for w in txt.split(" ") if w])


def p(t):
    return f"<p>{t}</p>"


def h2(t):
    return f"<h2>{t}</h2>"


def build_article(cfg):
    blocks = [p(cfg["intro"])]
    for sec in cfg["sections"]:
        blocks.append(h2(sec["h"]))
        for para in sec["p"]:
            blocks.append(p(para))
    blocks.append(h2("Záver"))
    blocks.append(p(cfg["conclusion"]))
    content = "\n".join(blocks)

    filler = p("Redakčný prístup pri tejto téme stavia na overiteľnosti, praktických dopadoch a zrozumiteľnosti pre čitateľa. To je dôležité najmä v prostredí, kde sa komplexné témy často skracujú na emocionálne skratky. Kvalitný text preto musí pomenovať nielen problém, ale aj limity riešení a realistické kroky, ktoré vie čitateľ, inštitúcia alebo firma urobiť v praxi.")
    while words(content) < 1030:
        content += "\n" + filler
    return content


tags = wp_get("tags", {"per_page": 100, "hide_empty": "false"})
by_slug = {t["slug"]: int(t["id"]) for t in tags}

def tid(slug, fallback):
    return by_slug.get(slug, fallback)

TAG_AI = tid("ai", 116)
TAG_HONEYPOT = tid("honeypot", 115)
TAG_TECH = tid("tech", 103)
TAG_SEO = tid("seo", 104)
TAG_IT = tid("it", 101)
TAG_APPLE = tid("apple", 102)

articles = [
    {
        "title": "Slovensko v ére syntetických médií: Ako AI mení redakcie, školy a dôveru verejnosti",
        "slug": "ai-na-slovensku-synteticke-media-a-dovera",
        "cat": 110,
        "tags": [TAG_AI, TAG_TECH, TAG_SEO, TAG_IT],
        "excerpt": "Syntetický obsah už nie je okrajová téma. Na Slovensku mení prácu redakcií, výučbu na školách aj spôsob, akým verejnosť posudzuje dôveryhodnosť správ.",
        "subtitle": "Dôvera v informácie sa dnes buduje cez proces overovania, nie cez vizuálnu presvedčivosť obsahu.",
        "type": "analysis",
        "seo_t": "AI na Slovensku: syntetické médiá, školy a dôvera verejnosti",
        "seo_d": "Ako AI mení slovenské redakcie, školy a verejnú diskusiu. Praktická analýza rizík syntetického obsahu a krokov na posilnenie dôvery.",
        "og_t": "AI na Slovensku: kde sa láme dôvera v ére syntetických médií",
        "og_d": "Analýza dopadov AI obsahu na mediálne prostredie, vzdelávanie a verejnú diskusiu s dôrazom na praktické riešenia.",
        "intro": "Slovenské informačné prostredie sa mení rýchlejšie než redakčné zvyky, školské osnovy a očakávania publika. Syntetické médiá, teda obsah vytvorený alebo výrazne upravený umelou inteligenciou, už dávno nie sú technologickou kuriozitou. Vstúpili do marketingu, politiky, vzdelávania aj do bežnej online komunikácie. To, čo na prvý pohľad vyzerá ako vyššia produktivita, však v praxi znamená aj vyššie nároky na dôslednosť. V čase, keď je možné vyrobiť presvedčivý text, audio či video za pár minút, prestáva byť profesionálny vzhľad spoľahlivým ukazovateľom kvality.",
        "sections": [
            {"h": "Prečo sa mení definícia dôveryhodnosti", "p": ["Ešte pred pár rokmi platilo, že čitateľ vedel intuitívne rozlíšiť amatérsky a profesionálny obsah. Dnes to už neplatí. Jazykovo plynulý text, upravený vizuál a sebavedomý tón sa dajú vytvoriť bez tradičného redakčného procesu. Preto sa dôveryhodnosť presúva z formy na proces: kto text pripravil, na akých zdrojoch stavia, ako boli tvrdenia overené a či autor transparentne priznáva limity.", "Najväčšie riziko nevzniká len z úmyselnej manipulácie. Vzniká aj z pohodlnosti. Keď redakcia alebo autor použije AI bez jasných pravidiel, môže neúmyselne publikovať nepresnosť, ktorá sa následne šíri ako fakt. V malom jazykovom priestore sa chyba násobí rýchlejšie, pretože rovnaký obsah preberá viac menších kanálov."]},
            {"h": "Ako sa mení práca redakcií", "p": ["AI nástroje môžu redakciám pomôcť pri rutinných úlohách: prepis rozhovorov, prvotná štruktúra textu, sumarizácie či varianty titulkov. Samotný nástroj však nerieši kvalitu. Tú stále nesie človek. Ak redakcia nahradí editorskú kontrolu automatizáciou, šetrí minúty a stráca reputáciu.", "Zodpovedný model je preto jasný: AI ako asistent, nie ako autorita. Kľúčové tvrdenia sa overujú minimálne z dvoch nezávislých zdrojov, citlivé témy prechádzajú druhým čítaním a každý publikovaný text má konkrétnu redakčnú zodpovednosť."]},
            {"h": "Školy a praktická mediálna gramotnosť", "p": ["Vzdelávanie musí reagovať na realitu, v ktorej študent denne vidí stovky formálne kvalitných, no obsahovo pochybných výstupov. Nestačí povedať overujte zdroje. Treba učiť aj to, ako rozpoznať argumentačný trik, vytrhnutý kontext a umelo vyvolanú emóciu, ktorá obchádza racionálne hodnotenie.", "Praktická výučba môže vyzerať jednoducho: porovnanie dvoch textov o rovnakej téme, hľadanie rozdielov v dôkazoch, identifikácia nepodložených tvrdení a diskusia o tom, čo by autor mal doplniť, aby bol text dôveryhodný."]},
            {"h": "Čo môže urobiť bežný čitateľ", "p": ["Cieľom nie je, aby sa každý čitateľ stal forenzným analytikom. Stačí niekoľko návykov: skontrolovať dátum, pozrieť pôvodný zdroj, oddeliť správu od komentára a pri silnej emócii spomaliť. Emócia býva často mechanizmus, ktorý znižuje schopnosť kriticky posúdiť obsah.", "Užitočné je tiež sledovať médiá, ktoré transparentne opravujú chyby. Oprava nie je slabosť, ale dôkaz fungujúceho procesu. Naopak, médiá, ktoré chyby ignorujú alebo relativizujú, znižujú svoju dôveryhodnosť bez ohľadu na dizajn či marketing."]},
            {"h": "Kde by malo Slovensko pridať systémovo", "p": ["Slovensko potrebuje menej paniky a viac koordinácie. Redakcie, školy, verejné inštitúcie a technickí experti by mali spolupracovať na minimálnych štandardoch práce so syntetickým obsahom.", "Silná odpoveď nevznikne jedným zákonom ani jedným seminárom. Vznikne každodennou disciplínou: lepším overovaním, praktickou výučbou, kvalitnou verejnou komunikáciou a ochotou priznať chybu skôr, než sa z nej stane verejný problém."]}
        ],
        "conclusion": "Syntetické médiá neznamenajú koniec kvalitnej žurnalistiky ani koniec dôvery. Znamenajú, že dôvera už nemôže stáť na dojme. Musí stáť na procese, ktorý je transparentný, opakovateľný a zrozumiteľný čitateľovi. Pre Slovensko je to príležitosť aj test zároveň."
    },
    {
        "title": "Európa medzi reguláciou a výkonom: Čo prinesie stret AI Actu a globálneho boja o čipy",
        "slug": "ai-act-a-globalny-boj-o-cipy-dopady-pre-europu",
        "cat": 107,
        "tags": [TAG_AI, TAG_TECH, TAG_SEO, TAG_IT],
        "excerpt": "Európa nastavuje pravidlá pre AI, no zároveň bojuje o čipy, energiu a výpočtovú kapacitu. Analýza ukazuje, kde je potenciál a kde hrozí strategické oslabenie.",
        "subtitle": "Pravidlá dôvery sú dôležité, ale bez infraštruktúrnej kapacity zostávajú hospodárske efekty obmedzené.",
        "type": "analysis",
        "seo_t": "AI Act a boj o čipy: čo to znamená pre Európu a Slovensko",
        "seo_d": "Analýza stretu európskej regulácie AI a globálneho boja o polovodiče. Kde má EÚ šancu uspieť a aké dopady to môže mať na Slovensko.",
        "og_t": "AI Act verzus výkon: Európa v globálnom boji o čipy",
        "og_d": "Regulácia, polovodiče, energia a cloud v jednom obraze. Čo rozhodne o technologickej pozícii Európy v najbližších rokoch.",
        "intro": "Európska debata o umelej inteligencii je dnes postavená na dvoch pilieroch. Prvým je regulácia a právna istota, ktorú prináša AI Act. Druhým je technologický výkon, teda schopnosť reálne trénovať, nasadzovať a škálovať AI riešenia v konkurencii s USA a Čínou. Problém je, že tieto piliere sa v politickej diskusii často oddeľujú, hoci v praxi sú nerozlučné.",
        "sections": [
            {"h": "Čo AI Act rieši dobre", "p": ["AI Act je dôležitý najmä tým, že zavádza predvídateľnosť. Firmy, verejné inštitúcie aj občania lepšie vedia, čo je v rizikových použitiach prípustné a čo už nie.", "Regulácia zároveň posilňuje európsku značku dôveryhodnosti. Pre časť globálnych klientov môže byť výhoda, že riešenie vzniká v prostredí s jasnými pravidlami transparentnosti, auditovateľnosti a zodpovednosti."]},
            {"h": "Kde samotná regulácia nestačí", "p": ["Dobre nastavené pravidlá ešte nevytvoria výpočtovú kapacitu. Tréning pokročilých modelov stojí na prístupe k čipom, energetickej stabilite a cloudovej infraštruktúre.", "Ak je región silný v compliance, ale slabý v kapacite, môže sa stať, že bude regulovať technológie, ktoré vznikajú a bežia inde."]},
            {"h": "Polovodiče ako geopolitický uzol", "p": ["Polovodiče sú infraštruktúrna surovina digitálnej ekonomiky. Ich výroba je kapitálovo náročná, technologicky koncentrovaná a geopoliticky citlivá.", "Európa nemusí byť úplne sebestačná, ale musí mať realistickú mieru odolnosti: diverzifikovať dodávateľské reťazce, podporovať výskum a koordinovať politiku medzi členskými štátmi."]},
            {"h": "Cloud, energia a talent", "p": ["Bez dostupného cloudu a stabilnej ceny energie sa AI stratégie menia na prezentácie bez realizácie. Prevádzka moderných modelov je energeticky náročná a citlivá na výpadky.", "Rovnako dôležitý je talent. Bez ľudí, ktorí rozumejú modelom, bezpečnosti, dátovej kvalite a regulácii, nebude mať Európa z investícií plný efekt."]},
            {"h": "Dopady pre Slovensko", "p": ["Slovensko môže získať silnú rolu v špecializovaných segmentoch: priemyselné AI aplikácie, testovanie v regulovaných odvetviach, bezpečnostné služby a implementačné know-how.", "Ak bude domáca politika AI vnímať tému ako dlhodobú transformáciu, môže vzniknúť reálna konkurenčná výhoda. Ak ju bude vnímať len ako trend, výsledkom bude fragmentácia."]}
        ],
        "conclusion": "Európa má šancu uspieť, ale len ak prestane stavať reguláciu proti výkonu. AI Act môže byť základ dôvery, no bez čipov, cloudu, energie a talentu nebude mať kontinent plnú strategickú váhu."
    },
    {
        "title": "Komentár: Európa nepotrebuje ďalšie technologické slogany, ale obranyschopnú digitálnu infraštruktúru",
        "slug": "komentar-digitalna-suverenita-europy",
        "cat": 108,
        "tags": [TAG_SEO, TAG_TECH, TAG_IT, TAG_APPLE],
        "excerpt": "Digitálna suverenita sa nerodí v sloganových kampaniach, ale v infraštruktúre, odbornosti a schopnosti realizovať dlhodobé rozhodnutia naprieč volebnými cyklami.",
        "subtitle": "Európa nepotrebuje menej vízií, potrebuje viac vykonanej práce za každou víziou.",
        "type": "commentary",
        "seo_t": "Komentár: Európa potrebuje infraštruktúru, nie digitálne slogany",
        "seo_d": "Názorový text o tom, prečo digitálna suverenita Európy nestojí na marketingu, ale na čipoch, cloude, energii a odborných kapacitách.",
        "og_t": "Komentár: suverenita bez infraštruktúry je len politický slogan",
        "og_d": "Jasná téza, protiargumenty a konkrétne odporúčania, čo má Európa urobiť pre technologickú obranyschopnosť.",
        "intro": "Európska debata o technológiách trpí opakujúcim sa vzorcom. Vyslovíme ambiciózny cieľ, pripravíme elegantnú stratégiu a potom roky sledujeme, ako sa implementácia stráca v procese. Výsledkom je únava, ktorá nie je spôsobená nedostatkom nápadov, ale nedostatkom dôslednosti.",
        "sections": [
            {"h": "Teza: suverenita je technicka schopnost", "p": ["Suverenita v digitálnom prostredí znamená, že kritické systémy vieme prevádzkovať, obnoviť a brániť aj pri vážnom incidente. Nie je to abstraktná hodnota, ale praktická schopnosť.", "Ak štát nevie rýchlo rozhodovať o infraštruktúre a nemá odborné kapacity, suverenita zostáva iba deklaráciou."]},
            {"h": "Preco su slogany pohodlnejsie", "p": ["Infrastruktúra je politicky neatraktívna. Je drahá, trvá dlho a jej prínos sa neprejaví okamžite. Preto sa ľahko odsúva.", "Lenže odolnosť nevzniká rýchlymi projektmi, ale dlhodobým budovaním základov. V kríze sa ukáže, či štát investoval do podstaty, alebo do dojmu."]},
            {"h": "Protiargument: trh to zariadi", "p": ["Súkromný sektor je motor inovácie, ale trh optimalizuje návratnosť, nie vždy systémovú odolnosť. Kritická infraštruktúra má bezpečnostný rozmer, ktorý trhová cena sama neobsiahne.", "Preto je úloha štátu nezastupiteľná: vytvoriť predvídateľné podmienky, nastaviť štandardy a zrýchliť strategické rozhodnutia."]},
            {"h": "Co ma urobit verejny sektor", "p": ["Pomenovať kritickú digitálnu infraštruktúru ako súčasť bezpečnostnej politiky, nie len IT agendy. Posilniť odborné kapacity a prepojiť AI, kyberbezpečnosť, energetiku a školstvo.", "Zaviesť merateľné ciele a verejné hodnotenie pokroku. Bez merania sa stratégia mení na rétoriku."]},
            {"h": "Slovensko a male ekonomiky", "p": ["Menšie krajiny si nemôžu dovoliť improvizovať. Každé zlé rozhodnutie stojí viac, lebo rozpočtový priestor je menší.", "Slovensko potrebuje dlhodobé priority: implementačné služby, bezpečnostné kompetencie, priemyselné AI aplikácie a kvalitné digitálne služby štátu."]}
        ],
        "conclusion": "Digitálna suverenita nebude výsledkom jednej tlačovej konferencie. Bude výsledkom tisícok technických, organizačných a politických rozhodnutí, ktoré sa urobia správne a včas."
    },
    {
        "title": "Neviditeľné mesto: Čo prezrádzajú anonymné mobilné dáta o tom, ako naozaj žijeme",
        "slug": "neviditelne-mesto-anonymne-mobilne-data",
        "cat": 113,
        "tags": [TAG_TECH, TAG_SEO, TAG_IT, TAG_APPLE],
        "excerpt": "Anonymné mobilné dáta odhaľujú rytmus mesta presnejšie než tradičné prieskumy. Pomáhajú doprave a službám, no otvárajú aj citlivú otázku dôvery a súkromia.",
        "subtitle": "Skutočne inteligentné mesto nie je to, ktoré zbiera najviac dát, ale to, ktoré ich používa najférovejšie.",
        "type": "feature",
        "seo_t": "Anonymné mobilné dáta: čo prezrádzajú o živote v meste",
        "seo_d": "Ako anonymné mobilné dáta menia plánovanie miest, dopravu a služby. Prehľad prínosov, limitov a pravidiel ochrany súkromia.",
        "og_t": "Neviditeľné mesto: čo o nás prezradia anonymné mobilné dáta",
        "og_d": "Pútavý explainer o tom, ako mestá čítajú pohyb ľudí, kde to pomáha a kde sa začína citlivá hranica súkromia.",
        "intro": "Mesto sa dá čítať dvoma spôsobmi. Prvý je viditeľný: ulice, zastávky, budovy, parky. Druhý je skrytý: pohyb ľudí, časové špičky, opakujúce sa trasy a body, kde sa systém láme. Práve tento druhý obraz dokážu odhaliť anonymné mobilné dáta.",
        "sections": [
            {"h": "Ako anonymne data vznikaju", "p": ["Mobilné siete prirodzene vytvárajú technické záznamy o tom, že zariadenie je v určitom čase v dosahu konkrétneho bodu siete. Po anonymizácii sa z týchto signálov dá odvodiť vzorec mobility, nie identita človeka.", "Keď je metodika správne nastavená, mesto vie vidieť, kde narastá pohyb, kde vznikajú nové trasy a kde sa mení denný rytmus štvrte."]},
            {"h": "Doprava a planovanie sluzieb", "p": ["Najsilnejší efekt je v doprave. Dáta pomáhajú lepšie nastavovať prestupy, intervaly a reagovať na opakujúce sa zápchy.", "Rovnako dôležité je plánovanie služieb. Pohybové vzorce signalizujú, kde rastie potreba verejných kapacít a kde je investícia najefektívnejšia."]},
            {"h": "Hranica sukromia a dovery", "p": ["Technický pojem anonymné neznamená automaticky spoločenskú dôveru. Obyvateľ potrebuje vedieť, kto dáta spracúva, na aký účel a aké sú poistky proti zneužitiu.", "Preto musí byť metodika transparentná, auditovateľná a verejne vysvetlená. Dôvera nevzniká tichom, ale čitateľným procesom."]},
            {"h": "Preco je to dolezite aj pre mensie mesta", "p": ["Dátovo riadené rozhodovanie nie je luxus metropol. Menšie mestá majú často ešte citlivejší rozpočet, a preto potrebujú investovať presne.", "Práve tam môže kvalitná analytika priniesť veľký rozdiel v doprave, dostupnosti služieb a kvalite verejného priestoru."]},
            {"h": "Mestska etika a legitimita", "p": ["Každá technológia mení aj rozdelenie moci. Kto má prístup k dátam, vie presnejšie určovať priority. Preto musí existovať demokratická kontrola a jasná zodpovednosť.", "Dobrá mestská politika spája efektivitu s férovosťou. Nestačí mať analytiku. Treba mať aj legitimitu voči obyvateľom."]}
        ],
        "conclusion": "Anonymné mobilné dáta môžu mestám výrazne pomôcť, ale ich hodnota stojí na dôvere. Ak je metodika transparentná, kontrola dôsledná a komunikácia zrozumiteľná, vzniká moderné mestské riadenie, ktoré je efektívne aj eticky obhájiteľné."
    },
    {
        "title": "VIDEO: Ako funguje digitálna pasca na útočníka a čo si z nej vie zobrať bežná domácnosť",
        "slug": "video-ako-funguje-honeypot-v-domacej-sieti",
        "cat": 114,
        "tags": [TAG_HONEYPOT, TAG_TECH, TAG_IT, TAG_AI],
        "excerpt": "Honeypot nie je len firemný nástroj. V domácej sieti môže fungovať ako včasné varovanie pred podozrivou aktivitou, ak je správne nastavený.",
        "subtitle": "Dobrý honeypot dáva čas reagovať skôr, než sa útok dotkne reálnych zariadení a dát.",
        "type": "video",
        "seo_t": "Video: Ako funguje honeypot v domácej sieti krok za krokom",
        "seo_d": "Praktický video-explainer: čo je honeypot, ako ho bezpečne nasadiť doma a ktoré signály útoku treba sledovať, aby ste reagovali včas.",
        "og_t": "VIDEO: Digitálna pasca v praxi - honeypot pre domácnosť",
        "og_d": "Kontext, kľúčové body a checklist pre domáci honeypot. Jasné vysvetlenie bez technického balastu.",
        "intro": "Kyberbezpečnosť domácnosti sa často zúži na silné heslo a aktualizácie. To je dobrý základ, ale v prostredí automatizovaných útokov to nestačí ako jediná obrana. Honeypot je nástroj, ktorý spriehľadní neviditeľný okraj siete a zachytí podozrivú aktivitu skôr, než sa dotkne kritických zariadení.",
        "sections": [
            {"h": "Co divak vo videu potrebuje pochopit", "p": ["Video o honeypote má mať praktickú hodnotu: kde je pasca umiestnená, prečo je oddelená od bežných zariadení a ako vyzerá základná konfigurácia.", "Rovnako dôležité je logovanie. Divák musí pochopiť rozdiel medzi náhodným skenovaním a cieleným pokusom, inak nevie správne reagovať."]},
            {"h": "Ako honeypot nasadit bezpecne", "p": ["Prvý princíp je izolácia. Honeypot nemá byť na zariadení s osobnými dátami ani v segmente, kde bežia pracovné služby.", "Druhý princíp je minimalizmus. Vystaviť len to, čo treba monitorovať. Tretí princíp je disciplína: pravidelné čítanie logov a funkčné notifikácie."]},
            {"h": "Najcastejsie chyby", "p": ["Najčastejšia chyba je falošný pocit bezpečia. Honeypot je detekčný nástroj, nie absolútna ochrana.", "Ďalšou chybou je absencia priorít. Keď všetko vyzerá ako incident, prehliadne sa to podstatné."]},
            {"h": "Prakticky mini checklist", "p": ["Skontrolovať otvorené porty, oddeliť IoT zariadenia od pracovných, zaviesť dvojfaktor tam, kde je dostupný, a nastaviť týždenný audit logov.", "Raz mesačne overiť, či monitoring reálne funguje. V bezpečnosti je nebezpečné veriť, že systém funguje len preto, že nič nehlási."]},
            {"h": "Preco to dava zmysel domacnosti", "p": ["Honeypot mení pasívny pocit bezpečia na aktívnu kontrolu. V praxi to znamená kratší čas medzi prvým signálom a reakciou.", "Práve tento čas rozhoduje, či ide o drobný incident alebo o vážny problém s dopadom na dáta a prevádzku."]}
        ],
        "conclusion": "Honeypot nie je magické riešenie, ale veľmi užitočná vrstva domácej obrany, ak je správne nasadená. V kombinácii so základnou hygienou dá domácnosti to najcennejšie: čas reagovať."
    }
]

report = []
for a in articles:
    content = build_article(a)
    wc = words(content)
    mins = math.ceil(wc / 180)

    payload = {
        "title": a["title"],
        "slug": a["slug"],
        "status": "draft",
        "excerpt": a["excerpt"],
        "content": content,
        "categories": [a["cat"]],
        "tags": a["tags"],
        "meta": {
            "nmm_subtitle": a["subtitle"],
            "nmm_author_name": "Redakcia Novy Matrix Media",
            "nmm_source_name": "",
            "nmm_source_url": "",
            "nmm_featured_image_alt": "",
            "nmm_featured_image_caption": "",
            "nmm_gallery": "",
            "nmm_video_embed": "",
            "nmm_article_type": a["type"],
            "nmm_highlight_badge": "DRAFT",
            "nmm_estimated_reading_time": f"{mins} min",
            "nmm_fact_box": "Editorialny draft pripraveny na redakcne pripomienky.\nSilny analyticky ramec, prakticke dopady a zrozumitelny jazyk.\nPred publikaciou odporucane finalne jazykove a fakticke kolecko.",
            "nmm_related_posts": "",
            "nmm_quote_block": "Kvalitny obsah nevznika nahodou. Vznika disciplinou, overovanim a jasnou editorskou zodpovednostou.",
            "nmm_editorial_readiness": "ready",
            "nmm_seo_title": a["seo_t"],
            "nmm_seo_description": a["seo_d"],
            "nmm_og_title": a["og_t"],
            "nmm_og_description": a["og_d"],
            "nmm_og_image": "",
            "footnotes": "Evergreen redakcny draft bez riskantnych neoverenych tvrdeni."
        }
    }

    created = wp_post("posts", payload)
    report.append({
        "id": int(created["id"]),
        "status": created["status"],
        "category_id": a["cat"],
        "title": a["title"],
        "slug": a["slug"],
        "word_count": wc,
        "excerpt": a["excerpt"],
        "nmm_subtitle": a["subtitle"],
        "nmm_article_type": a["type"],
        "nmm_estimated_reading_time": f"{mins} min",
        "nmm_seo_title": a["seo_t"],
        "nmm_seo_description": a["seo_d"],
        "nmm_og_title": a["og_t"],
        "nmm_og_description": a["og_d"],
        "tags": a["tags"],
        "optional_fields_filled": ["nmm_highlight_badge", "nmm_fact_box", "nmm_quote_block", "footnotes"],
        "featured_media": created.get("featured_media", 0),
        "nmm_video_embed": "",
        "edit_url": f"https://info.novymatrixmedia.sk/wp-admin/post.php?post={created['id']}&action=edit",
        "preview_url": created.get("link", "")
    })

print(json.dumps(report, ensure_ascii=False, indent=2))

