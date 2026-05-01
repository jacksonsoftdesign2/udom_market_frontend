// Tanzania regions and their districts
const TANZANIA_DATA = {
  "Arusha": ["Arusha City", "Arusha", "Karatu", "Longido", "Meru", "Monduli", "Ngorongoro"],
  "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Ubungo", "Kigamboni"],
  "Dodoma": ["Bahi", "Chamwino", "Chemba", "Dodoma City", "Kondoa", "Kongwa", "Mpwapwa"],
  "Geita": ["Bukombe", "Chato", "Geita", "Mbogwe", "Nyang'hwale"],
  "Iringa": ["Iringa Urban", "Iringa Rural", "Kilolo", "Mafinga", "Mufindi"],
  "Kagera": ["Biharamulo", "Bukoba Urban", "Bukoba Rural", "Karagwe", "Kyerwa", "Misenyi", "Muleba", "Ngara"],
  "Katavi": ["Mlele", "Mpanda", "Nsimbo"],
  "Kigoma": ["Buhigwe", "Kakonko", "Kasulu", "Kibondo", "Kigoma Urban", "Kigoma Rural", "Uvinza"],
  "Kilimanjaro": ["Hai", "Moshi Urban", "Moshi Rural", "Mwanga", "Rombo", "Same", "Siha"],
  "Lindi": ["Kilwa", "Lindi Urban", "Lindi Rural", "Liwale", "Nachingwea", "Ruangwa"],
  "Manyara": ["Babati Urban", "Babati Rural", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
  "Mara": ["Bunda", "Butiama", "Musoma Urban", "Musoma Rural", "Rorya", "Serengeti", "Tarime"],
  "Mbeya": ["Busokelo", "Chunya", "Kyela", "Mbarali", "Mbeya City", "Mbeya Rural", "Rungwe"],
  "Morogoro": ["Gairo", "Kilombero", "Kilosa", "Morogoro Urban", "Morogoro Rural", "Mvomero", "Ulanga"],
  "Mtwara": ["Masasi", "Mtwara Urban", "Mtwara Rural", "Nanyumbu", "Newala", "Tandahimba"],
  "Mwanza": ["Ilemela", "Kwimba", "Magu", "Misungwi", "Nyamagana", "Sengerema", "Ukerewe"],
  "Njombe": ["Ludewa", "Makambako", "Makete", "Njombe Urban", "Njombe Rural", "Wanging'ombe"],
  "Pwani": ["Bagamoyo", "Kibaha Urban", "Kibaha Rural", "Kisarawe", "Mafia", "Mkuranga", "Rufiji"],
  "Rukwa": ["Kalambo", "Nkasi", "Sumbawanga Urban", "Sumbawanga Rural"],
  "Ruvuma": ["Madaba", "Mbinga", "Namtumbo", "Nyasa", "Songea Urban", "Songea Rural", "Tunduru"],
  "Shinyanga": ["Kahama Urban", "Kahama Rural", "Kishapu", "Shinyanga Urban", "Shinyanga Rural"],
  "Simiyu": ["Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
  "Singida": ["Ikungi", "Iramba", "Manyoni", "Mkalama", "Singida Urban", "Singida Rural"],
  "Songwe": ["Ileje", "Mbozi", "Momba", "Songwe"],
  "Tabora": ["Igalula", "Igunga", "Kaliua", "Nzega", "Sikonge", "Tabora Urban", "Urambo", "Uyui"],
  "Tanga": ["Handeni Urban", "Handeni Rural", "Kilindi", "Korogwe Urban", "Korogwe Rural", "Lushoto", "Mkinga", "Muheza", "Pangani", "Tanga City"],
  "Zanzibar North": ["Kaskazini A", "Kaskazini B"],
  "Zanzibar South": ["Kusini", "Magharibi"],
  "Zanzibar West": ["Mjini", "Magharibi"],
  "Pemba North": ["Micheweni", "Wete"],
  "Pemba South": ["Chake Chake", "Mkoani"],
};

export const REGIONS = Object.keys(TANZANIA_DATA).sort();

export const getDistricts = (region) => {
  return TANZANIA_DATA[region] || [];
};

export default TANZANIA_DATA;