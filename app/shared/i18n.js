(function () {
    'use strict';
    var LANG = localStorage.getItem('aat_lang') || 'en';
    window.aatLang = LANG;

    var D = {
        /* landing + common */
        'Animal Adoption Tracker': 'एनिमल एडॉप्शन ट्रैकर', 'Animal Adoption Tracker · Admin': 'एनिमल एडॉप्शन ट्रैकर · एडमिन',
        'Giving every animal a loving home': 'हर जानवर को एक प्यार भरा घर देना', 'Checking your access…': 'आपकी पहुँच जाँची जा रही है…',
        'Shelter administration': 'शेल्टर प्रशासन', 'Adopter area': 'गोद लेने वालों का क्षेत्र', 'Dashboard': 'डैशबोर्ड',
        'Key figures and charts': 'मुख्य आँकड़े और चार्ट', 'Animals': 'जानवर', 'Manage animals': 'जानवरों का प्रबंधन', 'Shelters': 'शेल्टर',
        'Capacity and details': 'क्षमता और विवरण', 'Applications': 'आवेदन', 'Review and decide': 'समीक्षा करें और निर्णय लें',
        'Health': 'स्वास्थ्य', 'Checkups and treatment': 'जाँच और इलाज', 'Adoptions': 'गोद लेना', 'Records and documents': 'रिकॉर्ड और दस्तावेज़',
        'Inspections': 'निरीक्षण', 'Post-adoption visits': 'गोद लेने के बाद के दौरे', 'Users': 'उपयोगकर्ता', 'Adopter accounts': 'गोद लेने वालों के खाते',
        'Audit log': 'ऑडिट लॉग', 'Who did what, and when': 'किसने क्या किया, और कब', 'Adopter portal': 'एडॉप्टर पोर्टल',
        'Find a pet and track your applications': 'पालतू खोजें और अपने आवेदन ट्रैक करें', 'Please sign in to continue.': 'जारी रखने के लिए कृपया साइन इन करें।',
        'Sign in': 'साइन इन', 'Switch user': 'उपयोगकर्ता बदलें', 'Home': 'होम', 'Add another link': 'एक और लिंक जोड़ें', 'Loading…': 'लोड हो रहा है…', 'Not signed in': 'साइन इन नहीं है',
        'Your account has no role for this application yet. Please ask an administrator to assign you the Admin or User role.': 'इस एप्लिकेशन के लिए आपके खाते में अभी कोई भूमिका नहीं है। कृपया एडमिन से एडमिन या यूज़र भूमिका देने के लिए कहें।',
        /* dashboard */
        'Refresh': 'रीफ़्रेश', 'Total animals': 'कुल जानवर', 'Available': 'उपलब्ध', 'Adopted': 'गोद लिए गए', 'Reserved / treatment': 'आरक्षित / इलाज में',
        'Overdue checkups': 'बकाया जाँचें', 'Applications by status': 'स्थिति के अनुसार आवेदन', 'Adoptions over the last 6 months': 'पिछले 6 महीनों में गोद लेना',
        'Shelter occupancy': 'शेल्टर की भराव स्थिति', 'No shelters yet.': 'अभी कोई शेल्टर नहीं है।',
        'Submitted': 'जमा किया गया', 'Under Review': 'समीक्षाधीन', 'Approved': 'स्वीकृत', 'Rejected': 'अस्वीकृत', 'Withdrawn': 'वापस लिया गया',
        /* portal */
        'Find a pet': 'पालतू खोजें', 'My applications': 'मेरे आवेदन', 'My adoptions': 'मेरे गोद लिए जानवर', 'My profile': 'मेरी प्रोफ़ाइल',
        'Find your new best friend': 'अपना नया सबसे अच्छा दोस्त खोजें', 'Search by name or breed': 'नाम या नस्ल से खोजें',
        'All species': 'सभी प्रजातियाँ', 'All shelters': 'सभी शेल्टर', 'Show adopted / reserved too': 'गोद लिए / आरक्षित भी दिखाएँ',
        'No animals match your filters.': 'आपके फ़िल्टर से कोई जानवर नहीं मिला।', 'Apply to adopt': 'गोद लेने के लिए आवेदन करें',
        'Not open for adoption': 'गोद लेने के लिए उपलब्ध नहीं', 'Close': 'बंद करें', 'Health certificates': 'स्वास्थ्य प्रमाणपत्र',
        'Animal ID': 'जानवर आईडी', 'Species / breed': 'प्रजाति / नस्ल', 'Gender': 'लिंग', 'Age': 'आयु', 'Colour': 'रंग', 'Adoption fee': 'गोद लेने का शुल्क',
        'Shelter': 'शेल्टर', 'Shelter contact': 'शेल्टर संपर्क', 'A lovely animal looking for a home.': 'घर की तलाश में एक प्यारा जानवर।',
        'Housing type': 'आवास का प्रकार', 'Do you have other pets?': 'क्या आपके पास अन्य पालतू जानवर हैं?', 'Pet experience': 'पालतू जानवर रखने का अनुभव',
        'Apartment': 'अपार्टमेंट', 'Independent House': 'स्वतंत्र मकान', 'Farm': 'फ़ार्म', 'Other': 'अन्य', 'No': 'नहीं', 'Yes': 'हाँ',
        'Document type': 'दस्तावेज़ का प्रकार', 'Housing Proof': 'आवास प्रमाण', 'ID Proof': 'पहचान प्रमाण', 'Supporting Document': 'सहायक दस्तावेज़',
        'Name': 'नाम', 'Link (https://…)': 'लिंक (https://…)', '+ Add another link': '+ एक और लिंक जोड़ें', 'Submit application': 'आवेदन जमा करें',
        'Cancel': 'रद्द करें', 'Follow every step of your adoption journey.': 'अपनी गोद लेने की यात्रा का हर चरण देखें।',
        'You have not applied for any animal yet.': 'आपने अभी तक किसी जानवर के लिए आवेदन नहीं किया है।', 'Add document': 'दस्तावेज़ जोड़ें',
        'Withdraw': 'वापस लें', 'No documents': 'कोई दस्तावेज़ नहीं', 'Documents': 'दस्तावेज़', 'No inspections scheduled yet': 'अभी कोई निरीक्षण निर्धारित नहीं है',
        'Your adoption records, documents and follow-up inspections.': 'आपके गोद लेने के रिकॉर्ड, दस्तावेज़ और अनुवर्ती निरीक्षण।',
        'No adoptions yet. Your approved applications will appear here.': 'अभी कोई गोद लेना नहीं हुआ। आपके स्वीकृत आवेदन यहाँ दिखाई देंगे।',
        'Keep your contact details up to date.': 'अपना संपर्क विवरण अद्यतन रखें।', 'First name': 'पहला नाम', 'Last name': 'अंतिम नाम', 'Email': 'ईमेल',
        'Phone': 'फ़ोन', 'Address': 'पता', 'City': 'शहर', 'State': 'राज्य', 'Pincode': 'पिनकोड', 'Save changes': 'बदलाव सहेजें',
        'Profile saved': 'प्रोफ़ाइल सहेजी गई', 'Application withdrawn': 'आवेदन वापस ले लिया गया', 'Document added': 'दस्तावेज़ जोड़ा गया',
        'Please tell us why you want to adopt': 'कृपया बताएँ कि आप क्यों गोद लेना चाहते हैं',
        'Each document needs a name and a valid link starting with https://': 'हर दस्तावेज़ के लिए नाम और https:// से शुरू होने वाला सही लिंक ज़रूरी है',
        'Reserved': 'आरक्षित', 'Under Treatment': 'इलाज में', 'Healthy': 'स्वस्थ', 'Sick': 'बीमार', 'Injured': 'घायल', 'Critical': 'गंभीर',
        'Vaccinated': 'टीकाकृत', 'Partially Vaccinated': 'आंशिक टीकाकृत', 'Not Vaccinated': 'टीकाकरण नहीं हुआ', 'Active': 'सक्रिय',
        'Completed': 'पूर्ण', 'Cancelled': 'रद्द', 'Scheduled': 'निर्धारित', 'Validated': 'सत्यापित', 'Follow-up Required': 'अनुवर्ती आवश्यक',
        'Failed': 'असफल', 'Home Visit': 'घर का दौरा', 'Video Call': 'वीडियो कॉल', 'Phone Follow-up': 'फ़ोन अनुवर्ती',
        'Male': 'नर', 'Female': 'मादा', 'Unknown': 'अज्ञात', 'Dog': 'कुत्ता', 'Cat': 'बिल्ली', 'Rabbit': 'खरगोश', 'Bird': 'पक्षी',
        /* session bar */
        'Signed in as': 'साइन इन:', 'Admin dashboard': 'एडमिन डैशबोर्ड', 'Switch user / role': 'उपयोगकर्ता / भूमिका बदलें', 'Sign out': 'साइन आउट',
        'Admin': 'एडमिन', 'Adopter': 'एडॉप्टर', 'Checking sign-in…': 'साइन-इन जाँचा जा रहा है…', 'no role': 'कोई भूमिका नहीं',
        /* switch page */
        'Choose a test login': 'टेस्ट लॉगिन चुनें', 'Pick who you want to be. You can switch again at any time.': 'चुनें कि आप किस रूप में लॉगिन करना चाहते हैं। आप कभी भी दोबारा बदल सकते हैं।',
        'Local testing only. On the deployed app, real sign-in is used.': 'यह केवल लोकल टेस्टिंग के लिए है। डिप्लॉय किए गए ऐप में असली साइन-इन होगा।'
    };

    var P = [
        [/^(\d+) animals? waiting for a loving home\.$/, function (m) { return m[1] + ' जानवर एक प्यार भरे घर का इंतज़ार कर रहे हैं।'; }],
        [/^Applied on (.+)$/, function (m) { return 'आवेदन की तारीख: ' + m[1]; }],
        [/^Adopted on (.+)$/, function (m) { return 'गोद लेने की तारीख: ' + m[1]; }],
        [/^Updated (.+)$/, function (m) { return 'अपडेट किया गया: ' + m[1]; }],
        [/^Signed in as (.+)$/, function (m) { return 'साइन इन: ' + m[1]; }],
        [/^Staff remarks: (.+)$/, function (m) { return 'स्टाफ की टिप्पणी: ' + m[1]; }],
        [/^Reason: (.+)$/, function (m) { return 'कारण: ' + m[1]; }],
        [/^Application (.+) submitted( with .+)?$/, function (m) { return 'आवेदन ' + m[1] + ' जमा हो गया'; }],
        [/^Why would you like to adopt (.+)\? \*$/, function (m) { return 'आप ' + m[1] + ' को क्यों गोद लेना चाहते हैं? *'; }],
        [/^Adopt (.+)$/, function (m) { return m[1] + ' को गोद लें'; }],
        [/^(.+) · (\d+) of (\d+) places$/, function (m) { return m[1] + ' · ' + m[3] + ' में से ' + m[2] + ' जगहें भरी'; }],
        [/^next checkup (.+)$/, function (m) { return 'अगली जाँच: ' + m[1]; }]
    ];

    function lookup(key) {
        var out = D[key];
        if (!out) { for (var i = 0; i < P.length; i++) { var x = P[i][0].exec(key); if (x) { out = P[i][1](x); break; } } }
        return out;
    }
    function tr(s) {
        var full = s.trim();
        if (!full) { return s; }
        var lead = /^\s*/.exec(s)[0], trail = /\s*$/.exec(s)[0];
        var out = lookup(full);
        if (out) { return lead + out + trail; }
        var m = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}…?.)*]*)$/u.exec(full);   // keep emoji and symbols around the words
        if (!m || !m[2]) { return s; }
        out = lookup(m[2].trim());
        return out ? lead + m[1] + out + m[3] + trail : s;
    }
    window.aatT = function (s) { return LANG === 'hi' ? tr(s) : s; };
    // Fiori apps translate themselves (UI5 + the label files), so only translate the custom pages
    if (LANG !== 'hi' || /\/aat\.admin\./.test(location.pathname)) { return; }

    document.documentElement.lang = 'hi';
    var busy = false;

    function walk(root) {
        if (busy) { return; }
        busy = true;
        try {
            var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            var n, list = [];
            while ((n = w.nextNode())) {
                var p = n.parentNode && n.parentNode.nodeName;
                if (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA' || p === 'text' || p === 'tspan') { continue; }
                list.push(n);
            }
            list.forEach(function (t) {
                var par = t.parentNode;
                // dropdown options keep their English value, so the server still understands them
                if (par && par.nodeName === 'OPTION' && !par.hasAttribute('value')) { par.setAttribute('value', t.nodeValue.trim()); }
                var v = tr(t.nodeValue);
                if (v !== t.nodeValue) { t.nodeValue = v; }
            });
            if (root.querySelectorAll) {
                root.querySelectorAll('[placeholder]').forEach(function (e) {
                    var v = tr(e.getAttribute('placeholder')); if (v !== e.getAttribute('placeholder')) { e.setAttribute('placeholder', v); }
                });
            }
        } finally { busy = false; }
    }

    function start() {
        walk(document.body);
        new MutationObserver(function () { walk(document.body); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }
})();