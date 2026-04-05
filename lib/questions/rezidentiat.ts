export interface Intrebare {
  id: number;
  intrebare: string;
  optiuni: string[];
  raspunsCorect: string;
}

export const INTREBARI_REZIDENTIAT: Intrebare[] = [
  {
    id: 1,
    intrebare: 'Înainte de operația de chirurgie plastică, ce este obligat pacientul să facă?',
    optiuni: [
      'Să facă o Radiografie',
      'Să primească antibiotic',
      'Să semneze acordul pentru intervenție'
    ],
    raspunsCorect: 'Să semneze acordul pentru intervenție'
  },
  {
    id: 2,
    intrebare: 'Care este taxa stabilită pentru operația de chirurgie plastică?',
    optiuni: [
      '500.000$',
      '10.000$',
      '550.000$'
    ],
    raspunsCorect: '550.000$'
  },
  {
    id: 3,
    intrebare: 'În chirurgia plastică nazală, ce structură este remodelată?',
    optiuni: [
      'Mușchiul facial',
      'Structurile nazale (cartilaj/os)',
      'Plămânul'
    ],
    raspunsCorect: 'Structurile nazale (cartilaj/os)'
  },
  {
    id: 4,
    intrebare: 'Prin ce metodă se realizează scoaterea tatuajelor?',
    optiuni: [
      'Incizie',
      'Injecție',
      'Laser'
    ],
    raspunsCorect: 'Laser'
  },
  {
    id: 5,
    intrebare: 'De ce factor depinde numărul de impulsuri laser la scoaterea unui tatuaj?',
    optiuni: [
      'Dimensiunea tatuajului',
      'Pulsul pacientului',
      'Vârsta pacientului'
    ],
    raspunsCorect: 'Dimensiunea tatuajului'
  },
  {
    id: 6,
    intrebare: 'Ce trebuie să evite pacientul după procedura de scoatere a tatuajelor?',
    optiuni: [
      'Să maseze zona',
      'Să evite scărpinarea zonei',
      'Să îndepărteze crustele'
    ],
    raspunsCorect: 'Să evite scărpinarea zonei'
  },
  {
    id: 7,
    intrebare: 'Ce investigație este obligatorie înainte de operația pentru fractură?',
    optiuni: [
      'EKG',
      'Spirometrie',
      'Radiografie'
    ],
    raspunsCorect: 'Radiografie'
  },
  {
    id: 8,
    intrebare: 'Ce tip de anestezie se utilizează în operația de fractură?',
    optiuni: [
      'Propofol',
      'Xilină',
      'Tetracaină'
    ],
    raspunsCorect: 'Propofol'
  },
  {
    id: 9,
    intrebare: 'Cum se realizează stabilizarea unei fracturi în timpul intervenției?',
    optiuni: [
      'Bandaj',
      'Tijă metalică',
      'Laser'
    ],
    raspunsCorect: 'Tijă metalică'
  },
  {
    id: 10,
    intrebare: 'Ce instrumente se folosesc după incizie în operația de fractură?',
    optiuni: [
      'Defibrilator',
      'Atelă',
      'Depărtătoare'
    ],
    raspunsCorect: 'Depărtătoare'
  },
  {
    id: 11,
    intrebare: 'Care este simptomul principal în cazul unei apendicite?',
    optiuni: [
      'Durere în cadranul inferior drept',
      'Durere toracică',
      'Cefalee'
    ],
    raspunsCorect: 'Durere în cadranul inferior drept'
  },
  {
    id: 12,
    intrebare: 'Ce tip de anestezie se aplică pentru operația de apendicită?',
    optiuni: [
      'Rahianestezie',
      'Generală',
      'Locală'
    ],
    raspunsCorect: 'Generală'
  },
  {
    id: 13,
    intrebare: 'Cu ce instrument este îndepărtat apendicele?',
    optiuni: [
      'Foarfecă',
      'Laser',
      'Atelă'
    ],
    raspunsCorect: 'Foarfecă'
  },
  {
    id: 14,
    intrebare: 'Ce se utilizează pentru fixare în operația de coastă ruptă?',
    optiuni: [
      'Bandaj simplu',
      'Tijă',
      'Plăcuță metalică'
    ],
    raspunsCorect: 'Plăcuță metalică'
  },
  {
    id: 15,
    intrebare: 'Care este simptomul principal raportat în cazul unei coaste rupte?',
    optiuni: [
      'Durere toracică',
      'Febră',
      'Tuse'
    ],
    raspunsCorect: 'Durere toracică'
  },
  {
    id: 16,
    intrebare: 'În cazul unei plăgi împușcate, care este primul gest medical?',
    optiuni: [
      'Incizie',
      'Stază pe rană',
      'Antibiotic'
    ],
    raspunsCorect: 'Stază pe rană'
  },
  {
    id: 17,
    intrebare: 'Ce anestezic se folosește la scoaterea glonțului?',
    optiuni: [
      'Propofol',
      'Tetracaină',
      'Xilină'
    ],
    raspunsCorect: 'Xilină'
  },
  {
    id: 18,
    intrebare: 'Cu ce instrument se extrage glonțul din corp?',
    optiuni: [
      'Pensă',
      'Foarfecă',
      'Seringă'
    ],
    raspunsCorect: 'Pensă'
  },
  {
    id: 19,
    intrebare: 'Care este poziția pacientului în operația de hernie de disc?',
    optiuni: [
      'Pe spate',
      'În șezut',
      'Pe burtă'
    ],
    raspunsCorect: 'Pe burtă'
  },
  {
    id: 20,
    intrebare: 'Ce se îndepărtează efectiv în operația de hernie de disc?',
    optiuni: [
      'Os',
      'Fragment de disc herniat',
      'Mușchi'
    ],
    raspunsCorect: 'Fragment de disc herniat'
  },
  {
    id: 21,
    intrebare: 'Prin ce metodă se face intervenția în ruptura de menisc?',
    optiuni: [
      'Endoscopie',
      'Incizie mare',
      'Radiografie'
    ],
    raspunsCorect: 'Endoscopie'
  },
  {
    id: 22,
    intrebare: 'Care este rolul principal al meniscului?',
    optiuni: [
      'Digestie',
      'Stabilizare articulație',
      'Respirație'
    ],
    raspunsCorect: 'Stabilizare articulație'
  },
  {
    id: 23,
    intrebare: 'Ce echipament video se utilizează în operația de menisc?',
    optiuni: [
      'Defibrilator',
      'Laser extern',
      'Cameră video'
    ],
    raspunsCorect: 'Cameră video'
  },
  {
    id: 24,
    intrebare: 'Ce se face imediat după montarea tijei în operația de fractură?',
    optiuni: [
      'Defibrilare',
      'Dezinfectare și sutură',
      'Transport direct'
    ],
    raspunsCorect: 'Dezinfectare și sutură'
  },
  {
    id: 25,
    intrebare: 'Unde este dus pacientul după operația de apendicită?',
    optiuni: [
      'Externat imediat',
      'Trimis acasă',
      'În salon pentru recuperare'
    ],
    raspunsCorect: 'În salon pentru recuperare'
  }
];
