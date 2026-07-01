export const services = {
  civilRegistration: {
    name: {
      am: 'ወሳኝ ኩነት ምዝገባ',
      en: 'Vital Events Registration'
    },
    items: [
      {
        name: {
          am: 'የልደት ምዝገባ እና ማስረጃ አገልግሎት፣ የልደት እርማት ምዝገባ እና ማስረጃ አገልግሎት፣ የልደት ግልባጭ/ምትክ ምዝገባ እና ማስረጃ አገልግሎት',
          en: 'Birth Registration and Certificate Service, Birth Correction Registration and Certificate Service, Birth Duplicate/Replacement Registration and Certificate Service'
        },
        requirements: {
          am: 'አስመዝጋቢውን ጊዚው ያላለፈበት የነዋሪት መታወቂያ፤ብሔራዊ መታወቂያ ፤ከፍተኛው የአስተዳደር እርከን መደበኛ ነዋሪነቱን የሚገልጥ የድጋፍ ደብዳቤ ፤የስደተኛነቱን የሚገልጥ ማስረጃ ፤የመኖሪያ ፍቃድ ፤ከሚሰራበት መስራቤት ባልደረባነቱን የሚገልጥ የድጋፍ ደብዳቤ ፤የመስራቤቱ መታወቂያ ፤የመከላከያ ሰራዊት መታወቂያ ፤ ፓስፖርት እና ቪዛ ማቅረብ አለበት። ካምፕ/ፕሮጀክት በሚገኝበት አስተዳደር ጽ/ቤት የመደበኛ የነዋሪነት መታወቂያ የሌላቸው ልደት አስመዝጋቢዎችና ተመዝጋቢዎች ልደት ማስመዝገብ ሲፈልጉ ካምፑ /ፕሮጀክቱ/ፋብርካው የምዝገባ ጽ/ቤቱ በሚገኘበት ዝቅተና የአስተዳደር ጽ/ቤት አካባቢ መሆኑን በማረጋገጥና ተመዝጋቢዎቹ /አስመዝጋቢዎቹ የካምፑ/የፕሮጀክቱ/የፋብሪካው ሰራተኛ መሆናቸውን የሚገልጽ ማስረጃ ሲያቀርቡ መመዝገብ ይችላል። ልደቱ የተከሰተው በጤና ተቋም ከሆነ አስመዝጋቢው ከተቋሙ የተሰጠውን የልደት የማሳወቂያ ምስክር ወረቀት ማቅረብ አለበት። የህፃኑ አሳዳሪ /ተንከባካቢ ልደቱን ለማስመዝገብ ሲቀርብ ከፍርድ ቤት የተሰጠ ሕጋዊ ማስረጃ ማቅረብ አለባቸው። ተጥሎ የተገኘ ህፃንን ለማስመዝገብ የሚመጣ ፖሊስ /አግባብ ያለው የመንግስት አካል ማንነቱን የሚገልጽ ሕጋዊ መታወቂያ /ማስረጃ ማቅረብ አለበት። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት። የልደት ተመዝጋቢው የውጭ ዜጋ ከሆነ ከጠና ጸቋም የተሰጠ ማስረጃ ማቅረብ አለበት',
          en: 'Registrant\'s valid resident ID, national ID, support letter from higher administration confirming regular residence, refugee status proof, residence permit, support letter from workplace confirming employment, workplace ID, military ID, passport and visa must be provided. For those without regular resident ID in camp/project areas, proof of camp/project/factory location and employee status. If birth occurred at health facility, birth notification certificate from facility. If child\'s guardian/custodian applies, legal proof from court. For abandoned child, police/authorized government body must provide legal ID/proof. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency. If registrant is foreign national, proof from embassy/consulate must be provided.'
        },
        fee: 60,
        standardTime: '35 ደቂቃ',
        paymentMethod: {
          am: 'ለወቅታዊ ምዝገባ ለኢትዮጵያን ብር 60 / ስልሳ / ለውጭ ሀገር ዜጋ ብር 600 / ስድስት መቶ ብር/። ለዘገየ ምዝገባ ለኢትዮጵያን ብር 150 /አንድ መቶ ሃምስ ስልሳ/ ለውጭ ሀገር ዜጋ ብር 750 / ሰባት መቶ ሃምሳ ብር /። ጊዜ ገደቡ ያለፈ ምዝገባ ለኢትዮጵያን ብር 200 /ሁለት መቶ በር/ ለውጭ ሀገር ዜጋ ብር 600/ስድስት መቶተ ብር/',
          en: 'Current registration: For Ethiopians 60 ETB, For Foreign Nationals 600 ETB. Delayed registration: For Ethiopians 150 ETB, For Foreign Nationals 750 ETB. Time limit passed registration: For Ethiopians 200 ETB, For Foreign Nationals 600 ETB'
        }
      },
      {
        name: {
          am: 'የጋብቻ ምዝገባ እና ማስረጃ አገልግሎት፣ የጋብቻ እርማት ምዝገባ እና ማስረጃ አገልግሎት፣ የጋብቻ ግልባጭ/ምትክ ምዝገባ እና ማስረጃ አገልግሎት',
          en: 'Marriage Registration and Certificate Service, Marriage Correction Registration and Certificate Service, Marriage Duplicate/Replacement Registration and Certificate Service'
        },
        requirements: {
          am: 'ጊዚው ያላለፈበት የነዋሪት መታወቂያ፤ብሔራዊ መታወቂያ ፤የስደተኛነቱን የሚገልጥ ማስረጃ ፤፤የመከላከያ ሰራዊት መታወቂያ ፤ የመኖሪያ ፍቃድ ፤ ፓስፖርት እና ከዝቅተኛው አሰስተዳደር ት/ቤት የተሰጠ የነዋሪነት ማስረጃ ማቅረብ አለበት። ጋብቻው የሚፈጸመው በተጋቢ ዘመዶች /በቅረብ ዘመዶች መደበኛ መኖሪያ ቦታ ከሆነ የአስተዳደር ጽ/ቤት የተሰጠ የነዋሪነት ማስረጃ ማቅረብ አለበት። ካምፕ/ፕሮጀክት በሚገኝበት አስተዳደር ጽ/ቤት የመደበኛ የነዋሪነት መታወቂያ የሌላቸው ጋብቻ አስመዝጋቢዎች ጋብቻ ማስመዝገብ ሲፈልጉ ካምፑ /ፕሮጀክቱ/ፋብርካው የምዝገባ ጽ/ቤቱ በሚገኘበት ዝቅተና የአስተዳደር ጽ/ቤት አካባቢ መሆኑን በማረጋገጥና ተመዝጋቢዎቹ /አስመዝጋቢዎቹ የካምፑ/የፕሮጀክቱ/የፋብሪካው ሰራተኛ መሆናቸውን የሚገልጽ ማስረጃ ሲያቀርቡ መመዝገብ ይችላል። የተጋቢ ምስክሮች አገልግሎቱ ያላለፈበት የነዋሪነት መታወቂያ /ብሄራዊ መታወቂያ /ፓስፖርት /የመከላከያ መታወቂያ /ማንነታቸውን የሚገልጽ ማሰረጃ ማቅረብ አለባቸው። ከ6 ወር ወዲህ በተመሳሳይ ጊዜ የተነሱት ሁለት ሁለት 3በ4 የሆነ የተጋቢዎች ፎቶ ግራፍ መቅረብ አለበት። ሃይማኖታዊ እና ባህላዊ ስርአት የተፈረፀመ ጋብቻ የተተጋቢዎችን ምስከሮች /በጋብቻ ስርአቱ ላይ የታደሙ ሰው በክብር መዝገቡ ሹሙ ፊት በአካል በቀርበው ፊርማቸውን ማኖር አለባቸው። የተጋቢዎቹ የልደት የምስክር ወረቀት ካለ መቅረብ አለበት። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት',
          en: 'Valid resident ID, national ID, refugee status proof, military ID, residence permit, passport and residence proof from lower administration office must be provided. If marriage is performed at relatives\'/close relatives\' regular residence place, administration office residence proof must be provided. For those without regular resident ID in camp/project areas, proof of camp/project/factory location and employee status. Witnesses must provide valid resident ID/national ID/passport/military ID/proof of identity. Two passport photos (3×4) of spouses taken within last 6 months must be provided. For religious and traditional marriages, witnesses/spiritual leader must appear in person before registrar and sign. Spouses\' birth certificates if available must be provided. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency.'
        },
        fee: 120,
        standardTime: '15 ደቂቃ',
        paymentMethod: {
          am: 'ለወቅታዊ ምዝገባ ለኢትዮጵያን ብር120 / አንድ መቶ ሃያ ብር / ለውጭ ሀገር ዜጋ ከተጋቢዎቹ አንዱ ኢትዮጵያን ከሆነ ብር 600 / ስድስት መቶ ብር/ ሁለቱም ጠውጭ ዜጋ ከሆኑ 1050 /አንድ ሽህ ሀምሳ ብር። በዘገየ ምዝገባ ለወቅታዊ ምዝገባ ለኢትዮጵያን ብር 200 / ሁለት መቶ ብር / ለውጭ ሀገር ዜጋ ከተጋቢዎቹ አንዱ ኢትዮጵያን ከሆነ ብር 1050 /አንድ ሽህ ሀምሳ ብር/ ሁለቱም የውጭ ዜጋ ከሆኑ 1200 /አንድ ሽህ ሁለት መቶ ብር',
          en: 'Current registration: For Ethiopians 120 ETB, If one spouse is Ethiopian: 600 ETB, If both are foreign: 1050 ETB. Delayed registration: For Ethiopians 200 ETB, If one spouse is Ethiopian: 1050 ETB, If both are foreign: 1200 ETB'
        }
      },
      {
        name: {
          am: 'የፍች ምዝገባ እና ማስረጃ አገልግሎት፣ የፍች እርማት ምዝገባ እና ማስረጃ አገልግሎት፣ የፍች ግልባጭ/ምትክ ምዝገባ እና ማስረጃ አገልግሎት',
          en: 'Divorce Registration and Certificate Service, Divorce Correction Registration and Certificate Service, Divorce Duplicate/Replacement Registration and Certificate Service'
        },
        requirements: {
          am: 'የፍርድ ቤት የፍች ውሳኔ ዋናውን እና ኮፒ መቅረብ አለበት። አስመዝጋቢውን ጊዚው ያላለፈበት የነዋሪት መታወቂያ፤ብሔራዊ መታወቂያ ፤ከፍተኛው የአስተዳደር እርከን መደበኛ ነዋሪነቱን የሚገልጥ የድጋፍ ደብዳቤ ፤የስደተኛነቱን የሚገልጥ ማስረጃ ፤የመኖሪያ ፍቃድ ፤ከሚሰራበት መስራቤት ባልደረባነቱን የሚገልጥ የድጋፍ ደብዳቤ ፤የመስራቤቱ መታወቂያ ፤የመከላከያ ሰራዊት መታወቂያ ፤ ፓስፖርት እና ቪዛ ማቅረብ አለበት። ካምፕ/ፕሮጀክት በሚገኝበት አስተዳደር ጽ/ቤት የመደበኛ የነዋሪነት መታወቂያ የሌላቸው ፍች አስመዝጋቢዎች ፍች ማስመዝገብ ሲፈልጉ ካምፑ /ፕሮጀክቱ/ፋብርካው የምዝገባ ጽ/ቤቱ በሚገኘበት ዝቅተና የአስተዳደር ጽ/ቤት አካባቢ መሆኑን በማረጋገጥና ተመዝጋቢዎቹ /አስመዝጋቢዎቹ የካምፑ/የፕሮጀክቱ/የፋብሪካው ሰራተኛ መሆናቸውን የሚገልጽ ማስረጃ ሲያቀርቡ መመዝገብ ይችላል። ቀደም ሲል የጋብቻ የምስክር ወረቀት የተሰጠ እንደሆነ የጋብቻው የምስክር ወረቀት መቅረብ አለበት። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት። ፍችው የሚመዘገበው በውክልና ከሆነ ውክልና መቅረብ አለበት',
          en: 'Court divorce decision original and copy must be provided. Registrant\'s valid resident ID, national ID, support letter from higher administration confirming regular residence, refugee status proof, residence permit, support letter from workplace confirming employment, workplace ID, military ID, passport and visa must be provided. For those without regular resident ID in camp/project areas, proof of camp/project/factory location and employee status. If marriage certificate was previously issued, marriage certificate must be provided. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency. If divorce is registered by proxy, proxy must be provided.'
        },
        fee: 120,
        standardTime: '41 ደቂቃ',
        paymentMethod: {
          am: 'ለወቅታዊ ምዝገባ ለኢትዮጵያን ብር120 / አንድ መቶ ሃያ ብር/፤ለውጭ ሀገር ዜጋ ብር 600 / ስድስት መቶ ብር/። ለዘገየ ምዝገባ ለኢትዮጵያን ብር 200 /ሁለት መቶብር/፤ ለውጭ ሀገር ዜጋ ብር 900 / ዘጠኝ መቶ ብር /። ጊዜ ገደቡ ያለፈ ምዝገባ ለኢትዮጵያን ብር 250 /ሁለት መቶ ሃምሳ ብር / ለውጭ ሀገር ዜጋ ብር 1200 / አንድ ሽህ ሁለት መቶ ብር',
          en: 'Current registration: For Ethiopians 120 ETB, For Foreign Nationals 600 ETB. Delayed registration: For Ethiopians 200 ETB, For Foreign Nationals 900 ETB. Time limit passed registration: For Ethiopians 250 ETB, For Foreign Nationals 1200 ETB'
        }
      },
      {
        name: {
          am: 'የሞት ምዝገባ እና ማስረጃ አገልግሎት፣ የሞት እርማት ምዝገባ እና ማስረጃ አገልግሎት፣ የሞት ግልባጭ/ምትክ ምዝገባ እና ማስረጃ አገልግሎት',
          en: 'Death Registration and Certificate Service, Death Correction Registration and Certificate Service, Death Duplicate/Replacement Registration and Certificate Service'
        },
        requirements: {
          am: 'የጠያቂው የታደሰ መታወቂያ ወይም ፓስፖርት ፤ቪዛና የመኖሪያ ፍቃድ። የእድሳት አገልግሎት ሲሆን የቀድሞው ሰርተፍኬት ዋናውንና ኮፒውን መቅረብ አለበት። የኢምባሲ ማረጋገጫ ሲሆን ከኢንባሲው ተወካይ የታደሰ መታወቂያ ወይም ፓስፖርት ፤ቪዛ ወይም የመኖሪያ ፍቃድ ይዞ መቅረብ አለበት። ጥያቄው በውክልና ከሆነ ስለ ጉዳዩ በግልጽ የሚሳይ ልዩ ህጋዊ የውክልና ማስረጃ የወካይ የተወካይ በዘመኑ የታደሰና ሙሉ መረጃ የያዘ መታወቂያ ፤ፓስፖርት፤የወካይ ኮፒ፤የተወካይ ዋናውንና ኮፒ፤ከውጭ ከሆነ የታደሰ ፓስፖርት ዜግነቱን የሚገልጽ የመኖሪያ ፈቃድ ፤የስደተኞች መታወቂያ የተወካይ ዋናውና ኮፒ የወካይ ኮፒ ለእርማት ለሚቀርቡ ጥያቄዎች በፍርድ ቤት የተሰጠ ውሳኔ መቅረብ አለበት። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት',
          en: 'Applicant\'s valid ID or passport, visa and residence permit. For renewal service, previous certificate original and copy must be provided. For embassy verification, embassy representative must come with valid ID or passport, visa or residence permit. If request is by proxy, clear legal proxy proof, representative\'s and represented\'s valid full information ID, passport, representative\'s copy, represented\'s original and copy, if from abroad valid passport showing nationality, residence permit, refugee ID, represented\'s original and copy, representative\'s copy. For correction requests, court decision must be provided. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency.'
        },
        fee: 150,
        standardTime: '34 ደቂቃ',
        paymentMethod: {
          am: 'ለኢትዮጵያዊያን የሞት ምዝገባ ማስረጃ እድሳት፤ግልባጭ፤እርማት እና አገልግሎት ብር 150 /አንድ መቶ ሃምሳ ብር/። ለውጭ አገር የሞት ምዝገባ ማስረጃ እድሳት፤ግልባጭ፤እርማት እና ምትክ አገልግሎት ከተጋቢዎች አንዱ ኢትዮጵያዊ ከሆነ ብር 330 /ሶስት መቶ ሰላሳ ሃምሳ ብር/',
          en: 'For Ethiopians: 150 ETB for death registration certificate renewal, duplicate, correction and service. For foreign nationals: death registration certificate renewal, duplicate, correction and replacement service, if one of the parties is Ethiopian: 330 ETB'
        }
      },
      {
        name: {
          am: 'የጉዲፍቻ ምዝገባ እና ማስረጃ አገልግሎት፣ የጉዲፍቻ እርማት ምዝገባ እና ማስረጃ አገልግሎት፣ የጉዲፍቻ ግልባጭ/ምትክ ምዝገባ እና ማስረጃ አገልግሎት',
          en: 'Annulment Registration and Certificate Service, Annulment Correction Registration and Certificate Service, Annulment Duplicate/Replacement Registration and Certificate Service'
        },
        requirements: {
          am: 'የጠያቂው የታደሰ መታወቂያ ወይም ፓስፖርት ፤ቪዛና የመኖሪያ ፍቃድ ማቅረብ አለበት። የእድሳት አገልግሎት ሲሆን የቀድሞው ሰርተፍኬት ዋናውንና ኮፒውን መቅረብ አለበት። የኢምባሲ ማረጋገጫ ሲሆን ከኢንባሲው ተወካይ የታደሰ መታወቂያ ወይም ፓስፖርት ፤ቪዛ ወይም የመኖሪያ ፍቃድ ይዞ መቅረብ አለበት። ጥያቄው በውክልና ከሆነ ስለ ጉዳዩ በግልጽ የሚሳይ ልዩ ህጋዊ የውክልና ማስረጃ የወካይ የተወካይ በዘመኑ የታደሰና ሙሉ መረጃ የያዘ መታወቂያ ፤ፓስፖርት፤የወካይ ኮፒ፤የተወካይ ዋናውንና ኮፒ፤ከውጭ ከሆነ የታደሰ ፓስፖርት ዜግነቱን የሚገልጽ የመኖሪያ ፈቃድ ፤የስደተኞች መታወቂያ የተወካይ ዋናውና ኮፒ የወካይ ኮፒ ለእርማት ለሚቀርቡ ጥያቄዎች በፍርድ ቤት የተሰጠ ውሳኔ መቅረብ አለበት። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት',
          en: 'Applicant\'s valid ID or passport, visa and residence permit must be provided. For renewal service, previous certificate original and copy must be provided. For embassy verification, embassy representative must come with valid ID or passport, visa or residence permit. If request is by proxy, clear legal proxy proof, representative\'s and represented\'s valid full information ID, passport, representative\'s copy, represented\'s original and copy, if from abroad valid passport showing nationality, residence permit, refugee ID, represented\'s original and copy, representative\'s copy. For correction requests, court decision must be provided. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency.'
        },
        fee: 150,
        standardTime: '31 ደቂቃ',
        paymentMethod: {
          am: 'ለኢትዮጵያዊያን የጉድፍቻ ምዝገባ ማስረጃ እድሳት፤ግልባጭ፤እርማት እና አገልግሎት ብር 150 /አንድ መቶ ሃምሳ ብር/። ለውጭ አገር የሞት ምዝገባ ማስረጃ እድሳት፤ግልባጭ፤እርማት እና ምትክ አገልግሎት ከተጋቢዎች አንዱ ኢትዮጵያዊ ከሆነ ብር 600 /ስድስት መቶ ብር/',
          en: 'For Ethiopians: 150 ETB for annulment registration certificate renewal, duplicate, correction and service. For foreign nationals: annulment registration certificate renewal, duplicate, correction and replacement service, if one of the parties is Ethiopian: 600 ETB'
        }
      },
      {
        name: {
          am: 'አባትነትን በፍርድ ቤት ማወቅ ምዝገባና ማስረጃ አገልግሎት',
          en: 'Paternity Recognition by Court Registration and Certificate Service'
        },
        requirements: {
          am: 'የአስመዝጋቢው የታደሰ የነዋሪት/ብሄራዊ መታወቂያ ወይም ፓስፖርት ፤ ቪዛ ማቅረብ አለበት። አስመዝጋቢው የፍርድ ቤት ውሳኔ ማቅረብ አለበት። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት',
          en: 'Registrant\'s valid resident/national ID or passport, visa must be provided. Registrant must provide court decision. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency.'
        },
        fee: 92,
        standardTime: '31 ደቂቃ',
        paymentMethod: {
          am: 'ወቅታዊ ምዝገባ ብር 92 /ዘጠና ሁለት ብር/',
          en: 'Current registration: 92 ETB'
        }
      },
      {
        name: {
          am: 'ልጅነትን መቀበል ምዝገባና ማስረጃ አገልግሎት',
          en: 'Adoption Registration and Certificate Service'
        },
        requirements: {
          am: 'የአስመዝጋቢው የታደሰ የነዋሪት/ብሄራዊ መታወቂያ ወይም ፓስፖርት ፤ ቪዛ ማቅረብ አለበት። አንድ ሰው የክብር መዝገብ ሹም ፊት በመቅረብ አባት መሆኑን በመግለጽ በሚሰጠው ቃል / በጽሁፍ በሚደርገው ነዛዜ ውይም በሌላ በማናቸውም ስልጣን በተሰጠው ባለስልጣን በተረጋገጠ ስነድ አማካኝነት አባት መሆኑን ማስመዝገብ ይችላል። ከውጭ አገር ወደ ኢትዮጵያን የገቡ የኩነት ምዝገባ ደጋፊ ሰነዶች በውጭ ጉዳይ ሚኒስቴር መረጋገጥ እና በሰነዶች ምዝገባና ማረጋገጫ ኤጀንሲ መመዝገብ እና መረጋገጥ አለበት',
          en: 'Registrant\'s valid resident/national ID or passport, visa must be provided. A person can register paternity by appearing before registrar and declaring paternity by word/written statement or through any authority\'s verified document. Documents from abroad must be authenticated by Ministry of Foreign Affairs and registered/authenticated by Document Registration and Authentication Agency.'
        },
        fee: 92,
        standardTime: '31 ደቂቃ',
        paymentMethod: {
          am: 'ወቅታዊ ምዝገባ ብር 92 /ዘጠና ሁለት ብር/',
          en: 'Current registration: 92 ETB'
        }
      },
      {
        name: {
          am: 'ዲጂታል የነዋሪነት ምዝገባ አገልሎት',
          en: 'Digital Residence Registration Service'
        },
        requirements: {
          am: 'የታደሰ መታወቂያ',
          en: 'Valid ID'
        },
        fee: 0,
        standardTime: '50 ደቂቃ',
        paymentMethod: {
          am: 'በነጻ',
          en: 'Free'
        }
      },
      {
        name: {
          am: 'አዲስ የነዋሪነት መታወቂያ አገልግሎት፣ የመታወቂያ እድሳት አገልግሎት፣ ምትክ የመታወቂያ አገልግሎት',
          en: 'New Residence ID Card Service, ID Renewal Service, ID Replacement Service'
        },
        requirements: {
          am: 'ከወረዳው ውጭ ለነዋሪነት ምዝገባ እና አገልግሎት ለማግኘት ከመጣ የነዋሪነት መሸኛ ደብዳቤ መምጣት አለበት። በቤተሰብ ቅጽ ላይ ተመዝግቦ መገኘት አለበት። እድሜው 18 አመት እና ከዚያ በላይ የሆነ መሆን አለበት። ከስድስት ወር ወዲህ የተነሱት ሁለት ጉርድ ፎቶ ግራፍ /3×4መጠን ያለው/። ጠያቂው በአካል መገኘት አለበት',
          en: 'If coming from outside woreda: residence clearance letter must be brought. Must be registered in family form. Age must be 18 or above. Two passport photos (3×4 size) taken within last 6 months. Applicant must appear in person.'
        },
        fee: 100,
        standardTime: '3 ቀን',
        paymentMethod: {
          am: 'አዲስ የነዋሪነት መታወቂያ አገልግለዶት 100/መቶ ብር እድሳት በወቅቱ መቶ ብር ያለፈበት 200 ብር',
          en: 'New residence ID: 100 ETB, Renewal on time: 100 ETB, Late renewal: 200 ETB'
        }
      },
      {
        name: {
          am: 'አዲስ ያላገባ ማስረጃ አገልግሎት፣ እድሳት ያላገባ ማስረጃ፣ እርማት ያላገባ፣ ያላገባ ግልባጭ',
          en: 'New Unmarried Status Certificate Service, Renewal Unmarried Status, Correction Unmarried Status, Duplicate Unmarried Status'
        },
        requirements: {
          am: 'አለማግባቱን /ቷን ወይም ስለመፍታቱ/ቷን በቅጽ ላይ ተመዝግቦ መገኘት አለባቸው። በቅጽ ላይ የተመዘገበ የጋብቻ ሁኔታ ስተት ከሆነ/ያገባውን ያላገባ፡ ያላገባውን ያገባ በሚል ተገልጾ ከሆነ/ ጉዳዩን የሚያውቁ 3 ምስክሮችን በማቅረብ እና የቃለ መሃላ ቅጽ በመሙላት ግዴታ መግባት አለባቸው። ከኢትዮጵያ ውጭ የሚኖሩ ዜጎች ማስረጃውን ከኢትዮጵያ ከወጡት ቀን ጀምሮ ያለውን በሚመለከት ያላገባ ስለመሆናቸው በውጭ ጉዳይ ሚኒስቴር በሂደት ላይ እና በሰነዶች ማረጋገጫ የተረጋጠ እና የተመዘገበ ማስረጃ ማቅረብ አለባቸው',
          en: 'Must be registered in form showing unmarried status or divorce status. If marital status in form shows married/unmarried: unmarried/married, must provide 3 witnesses who know the case and fill oath form. For citizens living outside Ethiopia, must provide proof authenticated by Ministry of Foreign Affairs and verified and registered by Document Authentication Agency regarding unmarried status since leaving Ethiopia.'
        },
        fee: 200,
        standardTime: '20 ደቂቃ',
        paymentMethod: {
          am: 'ብር አዲስ ያላገባ 200 እድሳት ፣እርማትና ግልባጭ 250 ብር',
          en: 'New unmarried: 200 ETB, Renewal, correction and duplicate: 250 ETB'
        }
      },
      {
        name: {
          am: 'የነዋሪነት ምዝገባ ማረጋገጫ ደብዳቤ',
          en: 'Residence Registration Verification Letter'
        },
        requirements: {
          am: 'በቤተሰብ ቅጽ ላይ ተመዝግቦ መገኘት አለበት፣ የጠያቂው የታደሰ መታወቂያ ወይም ፓስፓርት ወይም መንጃ ፈቃድ ወይም የመኖሪያ ፈቃድ ወይም ሊሴፓሴ ማቅረብ አለበት',
          en: 'Must be registered in family form, applicant\'s valid ID or passport or driving license or residence permit or Laissez-passer must be provided'
        },
        fee: 0,
        standardTime: '5 ደቂቃ',
        paymentMethod: {
          am: 'በነጻ',
          en: 'Free'
        }
      },
      {
        name: {
          am: 'የነዋሪነት ማረጋገጫ ደብዳቤ አገልግሎት',
          en: 'Residence Verification Letter Service'
        },
        requirements: {
          am: 'በቤተሰብ ቅጽ ላይ ተመዝግቦ መገኘት አለበት፣ የጠያቂው የታደሰ መታወቂያ ወይም ፓስፓርት ወይም መንጃ ፈቃድ ወይም የመኖሪያ ፈቃድ ወይም ሊሴፓሴ ማቅረብ አለበት',
          en: 'Must be registered in family form, applicant\'s valid ID or passport or driving license or residence permit or Laissez-passer must be provided'
        },
        fee: 35,
        standardTime: '10 ደቂቃ',
        paymentMethod: {
          am: 'ብር 35 /ስላሳ አምስት ብር/',
          en: '35 ETB'
        }
      },
      {
        name: {
          am: 'ዝምድናን ከቅጽ ላይ ማረጋገጥ/እናትነት፣አባትነት፣ልጅነት፣እህትነት ወንድምነት እና አያትነትን ከቅጽ ላይ በማየት የማረጋገጥ አገልግሎት',
          en: 'Relationship Verification Service (Motherhood, Fatherhood, Child, Sibling, Grandparent)'
        },
        requirements: {
          am: 'በቤተሰብ ቅጽ ላይ ተመዝግቦ መገኘት አለበት፣ ዝምድናው በቅጹ ላይ መገለጽ አለበት፣ የጠያቂው የታደሰ መታወቂያ መቅረብ አለበት፣ ጥያቄው በውክልና ከሆነ የውክልና ህጋዊ ማስረጃ መኖር አለበት',
          en: 'Must be registered in family form, relationship must be shown in form, applicant\'s valid ID must be provided, if request is by proxy, legal proxy proof must exist'
        },
        fee: 35,
        standardTime: '10 ደቂቃ',
        paymentMethod: {
          am: 'ብር 35 /ስላሳ አምስት ብር/',
          en: '35 ETB'
        }
      },
      {
        name: {
          am: 'ዜግነት እንዲረጋጥ ጥያቄ ማቅረብ',
          en: 'Citizenship Verification Request'
        },
        requirements: {
          am: 'ማመልከቻ፣ ያልታደሰ መታወቂያ ወይም ፓስፖርት፣ ሊሴ ፓሴ /የጉዞ ሰነድ/',
          en: 'Application, unexpired ID or passport, Laissez-passer (travel document)'
        },
        fee: 0,
        standardTime: '32 ደቂቃ',
        paymentMethod: {
          am: 'በነጻ',
          en: 'Free'
        }
      },
      {
        name: {
          am: 'በህይወት ስለመኖር የማረጋገጥ አገልግሎት',
          en: 'Life Verification Service'
        },
        requirements: {
          am: 'ተገልጋዩ በአካል መገኘት አለበት፣ በቤተሰብ ቅጽ ላይ ተመዝግቦ መገኘት አለበት፣ የጠያቂው የታደሰ መታወቂያ መቅረብ አለበት',
          en: 'Service recipient must appear in person, must be registered in family form, applicant\'s valid ID must be provided'
        },
        fee: 0,
        standardTime: '10 ደቂቃ',
        paymentMethod: {
          am: 'በነጻ',
          en: 'Free'
        }
      },
      {
        name: {
          am: 'የነዋሪነት መሸኛ አገልግሎት',
          en: 'Residence Transfer Service'
        },
        requirements: {
          am: 'በቤተሰብ ቅጽ ላይ ተመዝግቦ መገኘት አለበት፣ መሸኛ ጠያቂው ግለሰብ በአካል /በግንበር / የወሰደውን መታወቂ ይዞ መቅረብ አለበት፣ መሠኛውን ሲወስድ ቀደም ሲል የወሰደውን መታወቂያ መመለስ አለበት',
          en: 'Must be registered in family form, transfer applicant must appear in person with the ID they received, when receiving new ID must return previous ID'
        },
        fee: 35,
        standardTime: '10 ደቂቃ',
        paymentMethod: {
          am: 'ብር 35 /ሰላሳ አምስት ብር/',
          en: '35 ETB'
        }
      },
      {
        name: {
          am: 'የሲስተም ምዝገባ አገልግሎት የጋብቻ ሁኔታ ለውጥ ሲኖር እንድስተካከል በደብዳቤ መጠየቅ',
          en: 'System Registration Service - Marriage Status Change Request by Letter'
        },
        requirements: {
          am: 'ተገልጋዩ በአካል መገኘት አለበት፣ የጋብቻ ሁኔታ ለውጡን በመረጃ ማቅረብ አለበት',
          en: 'Service recipient must appear in person, must provide information about marriage status change'
        },
        fee: 0,
        standardTime: '10 ደቂቃ',
        paymentMethod: {
          am: 'በነጻ',
          en: 'Free'
        }
      }
    ]
  },
  tradeOffice: {
    name: {
      am: 'ንግድ ጽ/ቤት',
      en: 'Trade Office'
    },
    items: [
      // የንግድ ግብይት ማስፋፊያ ቡድን - Trade Promotion Team
      {
        name: {
          am: 'በንግድ ዘርፍ ለተሰማሩ የህብረተሰብ ክፍሎች ግንዛቤ ማስጨበጫ ሙያዊ ምክክር ቴክኒካል ሙያዊምክር የቴክኒክ ድጋፍ ስልጠና መስጠት',
          en: 'Providing awareness raising professional consultation, technical professional consultation, technical support and training for community members engaged in trade sector'
        },
        requirements: {
          am: 'በንግድ ዘርፍ ለተሰማሩ የህብረተሰብ ክፍሎች ግንዛቤ ማስጨበጫ ሙያዊ ምክክር ቴክኒካል ሙያዊምክር የቴክኒክ ድጋፍ ስልጠና መስጠት',
          en: 'Providing awareness raising professional consultation, technical professional consultation, technical support and training for community members engaged in trade sector'
        },
        fee: 0,
        standard: {
          am: 'በስታንዳርድ መሰረት',
          en: 'Based on standard'
        },
        serviceGroup: {
          am: 'የንግድ ግብይት ማስፋፊያ ቡድን',
          en: 'Trade Promotion Team'
        }
      },
      {
        name: {
          am: 'የዘርፍ ማህበራትን እና ነጋዴ ማህበራትን ይደግፋል ያጠነክራል',
          en: 'Supporting and strengthening sector associations and merchant associations'
        },
        requirements: {
          am: 'የዘርፍ ማህበራትን እና ነጋዴ ማህበራትን ይደግፋል ያጠነክራል',
          en: 'Supporting and strengthening sector associations and merchant associations'
        },
        fee: 0,
        standard: {
          am: 'በስታንዳርድ መሰረት',
          en: 'Based on standard'
        },
        serviceGroup: {
          am: 'የንግድ ግብይት ማስፋፊያ ቡድን',
          en: 'Trade Promotion Team'
        }
      },
      {
        name: {
          am: 'የገበያ ትስስር መፍጠር',
          en: 'Creating market linkage'
        },
        requirements: {
          am: 'የገበያ ትስስር መፍጠር',
          en: 'Creating market linkage'
        },
        fee: 0,
        standard: {
          am: 'በስታንዳርድ መሰረት',
          en: 'Based on standard'
        },
        serviceGroup: {
          am: 'የንግድ ግብይት ማስፋፊያ ቡድን',
          en: 'Trade Promotion Team'
        }
      },
      // በንግድ ኢንስፔክሽን ሬጉላቶሪ ቡድን - Trade Inspection Regulatory Team
      {
        name: {
          am: 'በንግድ ድርጅት ላይ ቁጥጥርና ክትትል ማድረግ',
          en: 'Conducting control and monitoring on trade organizations'
        },
        requirements: {
          am: 'በንግድ ድርጅት ላይ ቁጥጥርና ክትትል ማድረግ',
          en: 'Conducting control and monitoring on trade organizations'
        },
        fee: 0,
        standard: {
          am: 'በስታንዳርድ መሰረት',
          en: 'Based on standard'
        },
        serviceGroup: {
          am: 'በንግድ ኢንስፔክሽን ሬጉላቶሪ ቡድን',
          en: 'Trade Inspection Regulatory Team'
        }
      },
      {
        name: {
          am: 'በህጋዊ የንግድ አሰራር ዙርያ ስልጠና መስጠት እና ግንዛቤ ማስጨበጥ',
          en: 'Providing training and raising awareness on legal trade practices'
        },
        requirements: {
          am: 'በህጋዊ የንግድ አሰራር ዙርያ ስልጠና መስጠት እና ግንዛቤ ማስጨበጥ',
          en: 'Providing training and raising awareness on legal trade practices'
        },
        fee: 0,
        standard: {
          am: 'በስታንዳርድ መሰረት',
          en: 'Based on standard'
        },
        serviceGroup: {
          am: 'በንግድ ኢንስፔክሽን ሬጉላቶሪ ቡድን',
          en: 'Trade Inspection Regulatory Team'
        }
      },
      {
        name: {
          am: 'ከሸማች ማህበረሰብ ጥቆማና ቀረታ መቀበልና ምላሽ መስጠት',
          en: 'Receiving complaints and feedback from consumer community and responding'
        },
        requirements: {
          am: 'ከሸማች ማህበረሰብ ጥቆማና ቀረታ መቀበልና ምላሽ መስጠት',
          en: 'Receiving complaints and feedback from consumer community and responding'
        },
        fee: 0,
        standard: {
          am: 'በስታንዳርድ መሰረት',
          en: 'Based on standard'
        },
        serviceGroup: {
          am: 'በንግድ ኢንስፔክሽን ሬጉላቶሪ ቡድን',
          en: 'Trade Inspection Regulatory Team'
        }
      },
      // የሸማቾች መብት ጥበቃ ቡድን - Consumer Rights Protection Team
      {
        name: {
          am: 'የሸማቹን እና የንግዱን ማህበረሰብ በህግ ማዕቀፍ ግንዛቤ መፍጠር',
          en: 'Creating legal framework awareness for consumer and business community'
        },
        requirements: {
          am: 'የሸማቹን እና የንግዱን ማህበረሰብ በህግ ማዕቀፍ ግንዛቤ መፍጠር',
          en: 'Creating legal framework awareness for consumer and business community'
        },
        fee: 0,
        standard: {
          am: 'ስታንዳርድ ያልወጣለቸው',
          en: 'Not standardized'
        },
        serviceGroup: {
          am: 'የሸማቾች መብት ጥበቃ ቡድን',
          en: 'Consumer Rights Protection Team'
        }
      },
      {
        name: {
          am: 'ከጤና መስፈርቶች ወይም ከደንቦች ጋር የማይጣጣሙ ሀሰተኛ አሳሳች የንግድ ማስታወቂያዎችን ቅድመ መከላከል ማረም',
          en: 'Preventing and correcting false and misleading trade advertisements that do not comply with health requirements or regulations'
        },
        requirements: {
          am: 'ከጤና መስፈርቶች ወይም ከደንቦች ጋር የማይጣጣሙ ሀሰተኛ አሳሳች የንግድ ማስታወቂያዎችን ቅድመ መከላከል ማረም',
          en: 'Preventing and correcting false and misleading trade advertisements that do not comply with health requirements or regulations'
        },
        fee: 0,
        standard: {
          am: 'ስታንዳርድ ያልወጣለቸው',
          en: 'Not standardized'
        },
        serviceGroup: {
          am: 'የሸማቾች መብት ጥበቃ ቡድን',
          en: 'Consumer Rights Protection Team'
        }
      },
      {
        name: {
          am: 'ሸማቹን ማህበረሰብ ጥቅም የሚጎዱ ጊዜ ያለፈባቸው ምርቶች እንዲሰባሰቡ ማድረግ',
          en: 'Ensuring expired products harmful to consumer community are collected'
        },
        requirements: {
          am: 'ሸማቹን ማህበረሰብ ጥቅም የሚጎዱ ጊዜ ያለፈባቸው ምርቶች እንዲሰባሰቡ ማድረግ',
          en: 'Ensuring expired products harmful to consumer community are collected'
        },
        fee: 0,
        standard: {
          am: 'ስታንዳርድ ያልወጣለቸው',
          en: 'Not standardized'
        },
        serviceGroup: {
          am: 'የሸማቾች መብት ጥበቃ ቡድን',
          en: 'Consumer Rights Protection Team'
        }
      },
      {
        name: {
          am: 'የሲቪል ማህበራትን መደገፍና ማብቃት ማደራጀት',
          en: 'Supporting and organizing civil society organizations'
        },
        requirements: {
          am: 'የሲቪል ማህበራትን መደገፍና ማብቃት ማደራጀት',
          en: 'Supporting and organizing civil society organizations'
        },
        fee: 0,
        standard: {
          am: 'ስታንዳርድ ያልወጣለቸው',
          en: 'Not standardized'
        },
        serviceGroup: {
          am: 'የሸማቾች መብት ጥበቃ ቡድን',
          en: 'Consumer Rights Protection Team'
        }
      }
    ]
  },
  laborSkills: {
    name: {
      am: 'ስራና ክህሎት',
      en: 'Labor & Skills'
    },
    items: [
      {
        name: {
          am: 'የስራ ዕድል አማራጭ ሊሆኑ የሚችሉ የስራ መስኮች ዝርዝር መለየት',
          en: 'Identifying Detailed List of Potential Job Opportunities'
        },
        requirements: {
          am: 'ኮሚቴ ማሳወቅ',
          en: 'Committee notification'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 2ሰዓትከ40ደቂቃ',
          en: 'Set Standard: 2 hours 40 minutes'
        },
        standardTime: '2ሰዓትከ40ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የስራ ስምሪት አገልግሎትና ኢንዱስትሪ ሰላም ቡድን',
          en: 'Employment Service and Industry Peace Team'
        }
      },
      {
        name: {
          am: 'የስራ ስምሪት አገልግሎት መስጠት',
          en: 'Providing Employment Service'
        },
        requirements: {
          am: 'የአዲስ አበባ የነዋሪነት መታወቂያ እና ስራ አጥ መታወቂያ ያለዉ/ያላት ስራ አጥ ምዝገባ ማካሄድ አሻራ መስጠት ስልጠና መዉሰድ',
          en: 'Addis Ababa resident ID and unemployment ID holder, conducting unemployment registration, providing fingerprint, receiving training'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ15ደቂቃ',
          en: 'Set Standard: 1 hour 15 minutes'
        },
        standardTime: '1ሰዓትከ15ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የስራ ስምሪት አገልግሎትና ኢንዱስትሪ ሰላም ቡድን',
          en: 'Employment Service and Industry Peace Team'
        }
      },
      {
        name: {
          am: 'ስራ ፈላጊዎችን የመመዝገብ አገልግሎት መስጠት',
          en: 'Providing Job Seeker Registration Service'
        },
        requirements: {
          am: 'የአዲስ አበባ የነዋሪነት መታወቂያ ያለዉ/ያላት ስራ አጥ ምዝገባ ማካሄድ አሻራ መስጠት',
          en: 'Addis Ababa resident ID holder, conducting unemployment registration, providing fingerprint'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ35ደቂቃ',
          en: 'Set Standard: 1 hour 35 minutes'
        },
        standardTime: '1ሰዓትከ35ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የስራ ስምሪት አገልግሎትና ኢንዱስትሪ ሰላም ቡድን',
          en: 'Employment Service and Industry Peace Team'
        }
      },
      {
        name: {
          am: 'የመረጃ ምክርና ግንዛቤ አገልግሎት መስጠት',
          en: 'Providing Information, Advice and Awareness Service'
        },
        requirements: {
          am: 'የአዲስ አበባ የነዋሪነት መታወቂያ እና ስራ አጥ መታወቂያ በአካል በመገኝት ተገልጋዩ የሚፈልገውን የሙያ ምክር መጠየቅ በተጠየቀው የሙያ ምክር መሰረት አገልግሎቱን ተደራሽ ማደረግ',
          en: 'Addis Ababa resident ID and unemployment ID, appearing in person, service recipient requesting needed professional advice, making service accessible based on requested professional advice'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓት',
          en: 'Set Standard: 1 hour'
        },
        standardTime: '1ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የስራ ስምሪት አገልግሎትና ኢንዱስትሪ ሰላም ቡድን',
          en: 'Employment Service and Industry Peace Team'
        }
      },
      {
        name: {
          am: 'ለስራ ፈላጊዎች የቴክኒክና የንግድ ክህሎት ስልጠና አገልግሎት መስጠት',
          en: 'Providing Technical and Business Skills Training Service for Job Seekers'
        },
        requirements: {
          am: 'የአዲስ አበባ የነዋሪነት መታወቂያ እና ስራ አጥ መታወቂያ አሻራ መስጠት',
          en: 'Addis Ababa resident ID and unemployment ID, providing fingerprint'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓት',
          en: 'Set Standard: 1 hour'
        },
        standardTime: '1ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የስራ ስምሪት አገልግሎትና ኢንዱስትሪ ሰላም ቡድን',
          en: 'Employment Service and Industry Peace Team'
        }
      },
      {
        name: {
          am: 'ስራ ፈላጊዎችን በኢንተርፕራይዝ የማድራጀት አገልግሎት መስጠት',
          en: 'Providing Enterprise Organization Service for Job Seekers'
        },
        requirements: {
          am: 'የአዲስ አበባ ነዋሪነት መታወቂያ፣በስራ ፈላጊነት የተመዘገበ ፣ የስራ ፈላጊ መታወቂያ ካርድ የመለሰ አሻራ የሰጠ ስልጠና የወሰደ',
          en: 'Addis Ababa resident ID, registered as job seeker, returned job seeker ID card, provided fingerprint, received training'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 2ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 2 hours 30 minutes'
        },
        standardTime: '2ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የስራ ስምሪት አገልግሎትና ኢንዱስትሪ ሰላም ቡድን',
          en: 'Employment Service and Industry Peace Team'
        }
      },
      {
        name: {
          am: 'በህዝብ ተሳትፎ ከተማ ልማታዊ ሴፍቲኔት ተጠቃሚዎች አደረጃጀት በህዝብ ተሳትፎ ከተማ ልማታዊ ሴፍቲኔት ተጠቃሚዎች አደረጃጀት መፍጠር',
          en: 'Creating Public Participation Urban Development Safety Net Beneficiaries Organization'
        },
        requirements: {
          am: 'የፕሮግራሙ ተጠቃሚ የሆኑ',
          en: 'Being a program beneficiary'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 4ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 4 hours 30 minutes'
        },
        standardTime: '4ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'በወረዳ ደረጃ የፕሮጀክቱ ተጠቃሚዎችን የልየታ ስራ መስራት',
          en: 'Conducting Project Beneficiaries Selection Work at Woreda Level'
        },
        requirements: {
          am: 'በወረዳዉ 6ወር የነዋሪነት ማስረጃ በሌሎች የእርዳታ ዘላቄ መንግሥታዊ እና መንግስታዊ ያልሆኑ ኘሮጆክቶች ላይ ተጠቃሚ ያልሆኑ በከፋ ድህነት ውስጥ መኖራቸውን ማረጋገጥ ቋሚ ስራ የሌላቸው መሆኑን ማረጋገጥ',
          en: '6 months residence proof in woreda, not beneficiaries of other assistance programs (governmental and non-governmental projects), confirming severe poverty, confirming no permanent work'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 6ሰዓት',
          en: 'Set Standard: 6 hours'
        },
        standardTime: '6ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የከተማ ልማታዊ ሴፍቲኔት ተጠቃሚዎች መረጃ በማኔጅመንት ኢንፎርሜሽን ሲስተም ማደራጀት',
          en: 'Organizing Urban Development Safety Net Beneficiaries Information in Management Information System'
        },
        requirements: {
          am: '(ባዶ)',
          en: '(None)'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓት',
          en: 'Set Standard: 1 hour'
        },
        standardTime: '1ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'በአካባቢ ልማት ስራዎች ላይ ተጠቃሚዎችን ማሰራትና ተጠቃሚ ማድረግ',
          en: 'Assigning and Making Beneficiaries for Community Development Works'
        },
        requirements: {
          am: 'የልማት ና የደህንነት መጠበቂያ መሳሪያ በመያዝ በቦታዉ መገኘት',
          en: 'Appearing at site with development and safety protective equipment'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓት',
          en: 'Set Standard: 1 hour'
        },
        standardTime: '1ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የአካባቢ ልማት ስራዎች ሰሪ ሀይሎችን ወደ ስራ ማስገባት፣ ማሰራት፣ መከታተልና መደገፍ',
          en: 'Engaging, Assigning, Monitoring and Supporting Community Development Works Labor Force'
        },
        requirements: {
          am: 'የልማት ና የደህንነት መጠበቂያ መሳሪያ በመያዝ በቦታዉ መገኘት',
          en: 'Appearing at site with development and safety protective equipment'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 2ሰዓት',
          en: 'Set Standard: 2 hours'
        },
        standardTime: '2ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'በአካባቢ ልማት ስራዎች ዙሪያ ለአመራርና ባለሙያዎች ስልጠና ማስጠት',
          en: 'Providing Training for Leadership and Experts on Community Development Works'
        },
        requirements: {
          am: 'ፍላጎት ማሳየት',
          en: 'Showing interest'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 18ደቂቃ',
          en: 'Set Standard: 18 minutes'
        },
        standardTime: '18ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'ለሚሰሩ የአካባቢ ልማት ስራዎች የሴፍጋርድ/ማህበራዊና አካባቢያዊ ደህንነት/ መጠበቅ ስራ መስራት',
          en: 'Conducting Safety Guard/Social and Community Safety Protection Work for Ongoing Community Development Works'
        },
        requirements: {
          am: 'ፕሮግራማቸውን ቀድመው በማሳወቅ',
          en: 'Previously announcing their program'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 2ሰዓት',
          en: 'Set Standard: 2 hours'
        },
        standardTime: '2ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'በፕሮጀክቱ የመሰረተ ልማት ስራዎች ተጠቃሚዎችን ወደ ስራ ማስገባት',
          en: 'Engaging Beneficiaries in Project-Based Development Works'
        },
        requirements: {
          am: 'በአምስቱ የስራ ዘርፍች ማደራጀት የደህንነት እና የስራ መሳሪያዎች መያዛቸውን ማረጋገጥ ህጻናትን በስራ ቦታ ይዘው አለመገኘታቸውን ማረጋገጥ ከ18 ዓመት በታች እና ከ60 ዓመት በላይ አለመሆናቸውን ማረጋገጥ',
          en: 'Organization in five work sectors, confirming possession of safety and work equipment, confirming not bringing children to work site, confirming not being under 18 years and over 60 years old'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 1 hour 30 minutes'
        },
        standardTime: '1ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የኑሮ ማሻሻያ ተጠቃሚዎች ተጨማሪ ጥሪት ማፍሪያ ላይ ማሰማራት',
          en: 'Assigning Livelihood Improvement Beneficiaries to Additional Quota Mafriya'
        },
        requirements: {
          am: 'የፕሮግራም ተጠቃሚ ስለመሆን መታወቂያ ያለው የመሰራት አቅም ያለው መሆኑን',
          en: 'Being program beneficiary, having ID, having work capacity'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 3ሰዓት',
          en: 'Set Standard: 3 hours'
        },
        standardTime: '3ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የኑሮ ማሻሻያ የድጋፍ ማእቀፎችን እንዲያገኙ ማድረግ',
          en: 'Facilitating Access to Livelihood Improvement Support Frameworks'
        },
        requirements: {
          am: 'ስልጠና የሚወሰድ የቤተሰብ ተወካይ መምረጥ ቤተሰቡ የተሰማማበት ስለመሆኑ የጋራ ስምምነት መፃፍ እና ማንበብ የሚችል',
          en: 'Selecting family representative who will take training, family has agreed, common agreement, able to write and read'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ10ደቂቃ',
          en: 'Set Standard: 1 hour 10 minutes'
        },
        standardTime: '1ሰዓትከ10ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የኑሮ ማሻሻያ ተጠቃሚ ቤተሰቦችን እና የገንዘብ ስጦታ የሚያገኙ ተጠቃሚዎችን መለየት',
          en: 'Identifying Livelihood Improvement Beneficiary Families and Cash Transfer Beneficiaries'
        },
        requirements: {
          am: 'ስልጠና የሚወሰድ የቤተሰብ ተወካይ መምረጥ ቤተሰቡ የተሰማማበት ስለመሆኑ የጋራ ስምምነት መፃፍ እና ማንበብ የሚችል',
          en: 'Selecting family representative who will take training, family has agreed, common agreement, able to write and read'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 1 hour 30 minutes'
        },
        standardTime: '1ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'በኑሮ ማሻሻያ የድጋፍ ማዕቀፎች ላይ የአቅም ግንባታ ስልጠና መስጠት',
          en: 'Providing Capacity Building Training on Livelihood Improvement Support Frameworks'
        },
        requirements: {
          am: 'እድሜው ከ35 -45 ያልበለጠ መሆን ቤተሰቡ የተሰማማበት ስለመሆኑ የጋራ ስምምነት መያዝ አለበት መፃፍ እና ማንበብ የሚችል',
          en: 'Age not exceeding 35-45, family has agreed, must have common agreement, able to write and read'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ33ደቂቃ',
          en: 'Set Standard: 1 hour 33 minutes'
        },
        standardTime: '1ሰዓትከ33ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የምክርና እና ድጋፍ አገልግሎት መስጠት',
          en: 'Providing Counseling and Support Service'
        },
        requirements: {
          am: 'የፕሮግራሙ ተጠቃሚ መሆን ፍላጎት ማሳየት',
          en: 'Being program beneficiary, showing interest'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 4ሰዓትከ45ደቂቃ',
          en: 'Set Standard: 4 hours 45 minutes'
        },
        standardTime: '4ሰዓትከ45ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የሴፍትኔት ተጠቃሚዎችን በማስመረቅ፥ የማሸጋገር ስራ መስራት',
          en: 'Graduating Safety Net Beneficiaries and Conducting Transition Work'
        },
        requirements: {
          am: 'በዳግም ልየታ ሲገቡ ተጠቃሚዎች ሁለት አመት በፕሮግራሙ መጀመሪያ ሲገቡ ተጠቃሚዎች ሦስት አመት መቆየት አለባቸው በማህበረሰብ አቀፍ ልማት ስራዎች ንዑስ ፕሮግራም የተሰለራ/ች መሆን አለበት በኘሮግራሙ የቆየበት ጊዜና በተከፈለው የብር መጠን 20 በመቶ መቆጠብ የቻለ/ች በኑሮ ማሻሸያ ንዑስ ኘሮግራም የሚሰጡ የስልጠና አይነቶች/ የህይወት ክህሎት የገንዘብ አያያዝና አጠቃቀም የንግድ ስራ እቅድ የቴክኒክ ስልጠናና የንግድ ልማት አገልግሎት /BDS/ስልጠና የቤተሰብ ተወካይ የመረጠ /ች የንግድ ስራ እቅድ በማዘጋጀት ያፀደቀ/ች በተዘጋጀ የቃል ኪዳን ሰነድ ምክኒያት የተፈራረሙ በቴክኒክና ሙያ ኮሌጀ ስልጠና መከታተሉነ የሚሰይ የተሳትፎ ሰርተፍኬት ማቅረብ የሚችል',
          en: 'For re-entry beneficiaries: two years stay required. For initial entry beneficiaries: three years stay required. Must be separated in community-based development works sub-program. Must have saved 20% of time stayed in program and amount paid. Must provide participation certificate showing completion of training types provided in livelihood improvement sub-program: life skills, money management and use, business work plan, technical training and business development service (BDS) training, family representative selected business work plan prepared and approved, separated due to prepared contract document, able to provide participation certificate showing attendance in technical and vocational college training'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 3ሰዓትከ45ደቂቃ',
          en: 'Set Standard: 3 hours 45 minutes'
        },
        standardTime: '3ሰዓትከ45ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የምግብ ዋስትና እና ሴፍቲኔት ቡድን',
          en: 'Food Security and Safety Net Team'
        }
      },
      {
        name: {
          am: 'የሀገር ውስጥ ገበያ ትስስር መፍጠር',
          en: 'Creating Domestic Market Linkage'
        },
        requirements: {
          am: 'ከወረዳና ከክ/ከተማ የሚጠየቁ የደጋፍ ደብዳቤና ሰነዶችን ማሟላት',
          en: 'Completing support letters and documents required from woreda and sub-city'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 4ሰዓትከ50ደቂቃ',
          en: 'Set Standard: 4 hours 50 minutes'
        },
        standardTime: '4ሰዓትከ50ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'ገበያ ልማት፤ ተሞክሮ ቅመራና ሽግግር ቡድን',
          en: 'Market Development, Experience Sharing and Transition Team'
        }
      },
      {
        name: {
          am: 'ምርትና አገልግሎትን ማስተዋወቅ',
          en: 'Promoting Products and Services'
        },
        requirements: {
          am: 'በንግድ ህጉ መሰረት በተለያየ የአደረጃጀት አይነቶች የተደራጀ',
          en: 'Organized in different organization types according to business law'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 4ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 4 hours 30 minutes'
        },
        standardTime: '4ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'ገበያ ልማት፤ ተሞክሮ ቅመራና ሽግግር ቡድን',
          en: 'Market Development, Experience Sharing and Transition Team'
        }
      },
      {
        name: {
          am: 'የግብዓት ትስስር መፍጠር',
          en: 'Creating Input Linkage'
        },
        requirements: {
          am: 'በንግድ ህጉ መሰረት በተለያየ የአደረጃጀት አይነቶች የተደራጀ',
          en: 'Organized in different organization types according to business law'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 3 ሰዓት',
          en: 'Set Standard: 3 hours'
        },
        standardTime: '3 ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'ገበያ ልማት፤ ተሞክሮ ቅመራና ሽግግር ቡድን',
          en: 'Market Development, Experience Sharing and Transition Team'
        }
      },
      {
        name: {
          am: 'የኦዲት አገልግሎት፣ምርጥ ተሞክሮ ቅመራና ደረጃ ዕድገት ድጋፍ መስጠት',
          en: 'Providing Audit Service, Best Practice Sharing and Growth Level Support'
        },
        requirements: {
          am: 'ንግድ ፍድ ንግድ ምዝገባ ፈቃድ ቲን ነምበር የበፊቱ የእድገት ደረጃ ሰርተፍኬት ለኦዲት የሚያስፈልጐ መረጃዎች',
          en: 'Business fee, business registration permit, TIN number, previous growth level certificate, information required for audit'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 4 ሰዓትከ20ደቂቃ',
          en: 'Set Standard: 4 hours 20 minutes'
        },
        standardTime: '4 ሰዓትከ20ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'ገበያ ልማት፤ ተሞክሮ ቅመራና ሽግግር ቡድን',
          en: 'Market Development, Experience Sharing and Transition Team'
        }
      },
      {
        name: {
          am: 'የማምረት አቅም አጠቃቀም መለካት',
          en: 'Measuring Production Capacity Utilization'
        },
        requirements: {
          am: 'ፍላጐት ማሳወቅ',
          en: 'Expressing interest'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 4ሰዓት',
          en: 'Set Standard: 4 hours'
        },
        standardTime: '4ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የኢንተርፕራይዝ ልማት ድጋፍና ክትትል ቡድን',
          en: 'Enterprise Development Support and Monitoring Team'
        }
      },
      {
        name: {
          am: 'የድርድርና የኮሚሽንኒንግ አገልግሎት መስጠት',
          en: 'Providing Networking and Communication Service'
        },
        requirements: {
          am: 'ፍቃደኝነት ፣ መረጃ መስጠት እና መተግበር',
          en: 'Willingness, providing information and implementation'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 1 hour 30 minutes'
        },
        standardTime: '1ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የኢንተርፕራይዝ ልማት ድጋፍና ክትትል ቡድን',
          en: 'Enterprise Development Support and Monitoring Team'
        }
      },
      {
        name: {
          am: 'የካፒታል ሊዝ ድጋፍ እንዲያገኙ ማመቻቸት',
          en: 'Facilitating Access to Capital Lease Support'
        },
        requirements: {
          am: 'ፍላጎት ማሳውቅ',
          en: 'Expressing interest'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓት',
          en: 'Set Standard: 1 hour'
        },
        standardTime: '1ሰዓት',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የኢንተርፕራይዝ ልማት ድጋፍና ክትትል ቡድን',
          en: 'Enterprise Development Support and Monitoring Team'
        }
      },
      {
        name: {
          am: 'የመስሪያ፣ ማሳያ እና መሸጫ ቦታ ማመቻቸት',
          en: 'Facilitating Workspace, Display and Sales Space'
        },
        requirements: {
          am: 'ፍላጎት ማሳውቅ ማሳተፍ',
          en: 'Expressing interest and participation'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 1ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 1 hour 30 minutes'
        },
        standardTime: '1ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የኢንተርፕራይዝ ልማት ድጋፍና ክትትል ቡድን',
          en: 'Enterprise Development Support and Monitoring Team'
        }
      },
      {
        name: {
          am: 'የፋይናንስ ድጋፍ እንዲያገኙ ማመቻቸት',
          en: 'Facilitating Access to Financial Support'
        },
        requirements: {
          am: 'ፍላጎት ማሳወቅና መረጀ መስጠት',
          en: 'Expressing interest and providing information'
        },
        fee: 0,
        standard: {
          am: 'የተቀመጠው ስታንዳርድ: 2ሰዓትከ30ደቂቃ',
          en: 'Set Standard: 2 hours 30 minutes'
        },
        standardTime: '2ሰዓትከ30ደቂቃ',
        quality: '100%',
        deliveryMethod: {
          am: 'በአካል',
          en: 'In person'
        },
        serviceGroup: {
          am: 'የኢንተርፕራይዝ ልማት ድጋፍና ክትትል ቡድን',
          en: 'Enterprise Development Support and Monitoring Team'
        }
      }
    ]
  },
  chiefExecutiveOffice: {
    name: {
      am: 'የዋና ስ/አስፈፃሚ ፅ/ቤት',
      en: 'Chief Executive Office'
    },
    items: [
      {
        name: {
          am: 'ቅሬታ መቀበል',
          en: 'Complaint Reception'
        },
        requirements: {
          am: 'በደብዳቤ ለፅ/ቤቱ ዝርዝር ቅሬታ ማቅረብ፣ የሚቀርቡ ጉዳዮች በፍርድ ቤት ጉዳዩ ያልተያዘ መሆን አለበት፣ የሚቀርበው ቅሬታ የምክር ቤት ቋሚ ኮሚቴ ያልያዘው መሆን አለበት',
          en: 'Submit detailed complaint to office in writing, Issues to be submitted must not be pending in court, Complaint to be submitted must not be handled by standing committee of council'
        },
        fee: 0
      },
      {
        name: {
          am: 'የመልካም አስተዳደር ጥያቄዎችን መቀበል መለየት እንዲፈቱ ማድረግ',
          en: 'Good Governance Request Reception and Resolution'
        },
        requirements: {
          am: 'በየብሎኩ በተዘጋጀው ቅፅ መሰረት ችግሮች የተለዩ መሆናቸው፣ በብሎክ ኮሚቴ የተለዩና የተረጋገጡ የጋራመግባባት የተያዘበት መሆን አለበት',
          en: 'Problems must be separated according to the form prepared by each block, Must be separated and confirmed by block committee and common agreement must be held'
        },
        fee: 0
      }
    ]
  }
}
