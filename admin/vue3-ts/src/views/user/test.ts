type TupleMapId<T extends { id: any }[]> = T[keyof T & number]['id']

type ActionId = TupleMapId<[{
  id: 1,
  name: 'user1'
},
  {
    id: 2,
    name: 'user2'
  },
  {
    id: 3,
    name: 'user3'
  }]>

const a: ActionId = 3
