export default [
  {
    name: 'Длина(км)',
    field: 'length',
    criterias: [
      {
        name: 'Оч. короткая',
        from: 0,
        to: 5,
      },
      {
        name: 'Короткая',
        from: 5,
        to: 10,
      },
      {
        name: 'Средняя',
        from: 10,
        to: 15,
      },
      {
        name: 'Длинная',
        from: 15,
        to: 20,
      },
      {
        name: 'Оч. длинная',
        from: 20,
        to: 30,
      },
      {
        name: 'Запредельная',
        from: 30,
        to: 99999,
      },
    ],
  },
  {
    name: 'Средний перегон(м)',
    field: 'segment_length_avg',
    criterias: [
      {
        name: 'Оч. короткий',
        from: 0,
        to: 100,
      },
      {
        name: 'Короткий',
        from: 100,
        to: 250,
      },
      {
        name: 'Средний',
        from: 250,
        to: 400,
      },
      {
        name: 'Длинный',
        from: 400,
        to: 700,
      },
      {
        name: 'Оч. длинный',
        from: 700,
        to: 1500,
      },
      {
        name: 'Запредельный',
        from: 1500,
        to: 99999,
      },
    ],
  },
  {
    name: 'Скорость(км/ч)',
    field: 'transit_speed',
    criterias: [
      {
        name: 'Оч. низкая',
        from: 0,
        to: 5,
      },
      {
        name: 'Низкая',
        from: 5,
        to: 12,
      },
      {
        name: 'Средняя',
        from: 12,
        to: 20,
      },
      {
        name: 'Высокая',
        from: 20,
        to: 30,
      },
      {
        name: 'Оч. высокая',
        from: 30,
        to: 40,
      },
      {
        name: 'Запредельная',
        from: 40,
        to: 99999,
      },
    ],
  },
  {
    name: 'Интервал(мин)',
    field: 'transit_interval',
    criterias: [
      {
        name: 'Ультравысокочастотный',
        from: 0,
        to: 3,
      },
      {
        name: 'Высоко частотный',
        from: 3,
        to: 7,
      },
      {
        name: 'Частотный',
        from: 7,
        to: 12,
      },
      {
        name: 'Среднечастотный',
        from: 12,
        to: 20,
      },
      {
        name: 'Низкочастотный',
        from: 20,
        to: 45,
      },
      {
        name: 'Ультранизкочастотный',
        from: 45,
        to: 99999,
      },
    ],
  },
  {
    name: 'Пассажиры (Маш-км)',
    field: 'passengers_per_vehicle_kilometers',
    criterias: [
      {
        name: 'Невыгодный',
        from: 0,
        to: 1.7,
      },
      {
        name: 'Мало выгодный',
        from: 1.7,
        to: 3.4,
      },
      {
        name: 'Средне выгодный',
        from: 3.4,
        to: 5.1,
      },
      {
        name: 'Выгодный',
        from: 5.1,
        to: 6.8,
      },
      {
        name: 'Оч. выгодный',
        from: 6.8,
        to: 8.5,
      },
      {
        name: 'Супер выгодный',
        from: 8.5,
        to: 99999,
      },
    ],
  },
  {
    name: 'Пасс-Км (маш-км)',
    field: 'passenger_kilometers_per_vehicle_kilometers',
    criterias: [
      {
        name: 'Неэффективный',
        from: 0,
        to: 5,
      },
      {
        name: 'Низкоэффективный',
        from: 5,
        to: 10,
      },
      {
        name: 'Среднеэффективный',
        from: 10,
        to: 20,
      },
      {
        name: 'Эффективный',
        from: 20,
        to: 35,
      },
      {
        name: 'Оч. эффективный',
        from: 35,
        to: 50,
      },
      {
        name: 'Cуперэффективный',
        from: 50,
        to: 99999,
      },
    ],
  },
  {
    name: 'Непрямолинейность (гео 1)',
    field: 'curvature_coefficient_geo1',
    criterias: [
      {
        name: 'отсутствует',
        from: 0,
        to: 1,
      },
      {
        name: 'легкая',
        from: 1,
        to: 1.3,
      },
      {
        name: 'средняя',
        from: 1.3,
        to: 1.6,
      },
      {
        name: 'сильная',
        from: 1.6,
        to: 2,
      },
      {
        name: 'Оч. сильная',
        from: 2,
        to: 3,
      },
      {
        name: 'критична',
        from: 3,
        to: 99999,
      },
    ],
  },
  {
    name: 'Непрямолинейность (гео 2)',
    field: 'curvature_coefficient_geo2',
    criterias: [
      {
        name: 'отсутствует',
        from: 0,
        to: 1,
      },
      {
        name: 'легкая',
        from: 1,
        to: 1.3,
      },
      {
        name: 'средняя',
        from: 1.3,
        to: 1.6,
      },
      {
        name: 'сильная',
        from: 1.6,
        to: 2,
      },
      {
        name: 'Оч. сильная',
        from: 2,
        to: 3,
      },
      {
        name: 'критична',
        from: 3,
        to: 99999,
      },
    ],
  },
  {
    name: 'Непрямолинейность (пассажиры)',
    field: 'curvature_coefficient_passengers',
    criterias: [
      {
        name: 'отсутствует',
        from: 0,
        to: 1,
      },
      {
        name: 'легкая',
        from: 1,
        to: 1.3,
      },
      {
        name: 'средняя',
        from: 1.3,
        to: 1.6,
      },
      {
        name: 'сильная',
        from: 1.6,
        to: 2,
      },
      {
        name: 'Оч. сильная',
        from: 2,
        to: 3,
      },
      {
        name: 'критична',
        from: 3,
        to: 99999,
      },
    ],
  },
  {
    name: 'Средняя дальность (км)',
    field: 'trip_avg_distance',
    criterias: [
      {
        name: 'оч. короткая',
        from: 0,
        to: 1,
      },
      {
        name: 'короткая',
        from: 1,
        to: 3,
      },
      {
        name: 'средняя',
        from: 3,
        to: 7,
      },
      {
        name: 'длинная',
        from: 7,
        to: 12,
      },
      {
        name: 'Оч. длинная',
        from: 12,
        to: 16,
      },
      {
        name: 'критична',
        from: 16,
        to: 99999,
      },
    ],
  },
  {
    name: 'Сменность',
    field: 'trip_shift',
    criterias: [
      {
        name: 'отсутствует',
        from: 0,
        to: 1,
      },
      {
        name: 'легкая',
        from: 1,
        to: 1.3,
      },
      {
        name: 'средняя',
        from: 1.3,
        to: 2,
      },
      {
        name: 'сильная',
        from: 2,
        to: 3.5,
      },
      {
        name: 'Оч. сильная',
        from: 3.5,
        to: 5,
      },
      {
        name: 'критичная',
        from: 5,
        to: 99999,
      },
    ],
  },
  {
    name: 'Коэффициент неравномерности наполнения',
    field: 'capacity_coefficient',
    criterias: [
      {
        name: 'оч. низкий',
        from: 0,
        to: 1,
      },
      {
        name: 'низкий',
        from: 1,
        to: 1.3,
      },
      {
        name: 'средний',
        from: 1.3,
        to: 1.8,
      },
      {
        name: 'высокий',
        from: 1.8,
        to: 2.5,
      },
      {
        name: 'Оч. высокий',
        from: 2.5,
        to: 3.5,
      },
      {
        name: 'критичный',
        from: 3.5,
        to: 99999,
      },
    ],
  },
  {
    name: 'Интегральный показатель',
    field: 'integral_index',
    criterias: [
      {
        name: 'оч. низкий',
        from: 0,
        to: 0.6,
      },
      {
        name: 'низкий',
        from: 0.6,
        to: 1.2,
      },
      {
        name: 'средний',
        from: 1.2,
        to: 1.8,
      },
      {
        name: 'высокий',
        from: 1.8,
        to: 2.4,
      },
      {
        name: 'Оч. высокий',
        from: 2.4,
        to: 3,
      },
      {
        name: 'критичный',
        from: 3,
        to: 99999,
      },
    ],
  },
];
