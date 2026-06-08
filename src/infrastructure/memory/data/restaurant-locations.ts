export interface RestaurantLocation {
  neighborhood: string;
  address: string;
  phone: string;
}

export const RESTAURANT_LOCATIONS: Record<string, RestaurantLocation> = {
  "rest-1": {
    neighborhood: "Parque Progresso",
    address: "Av. Paulo VI, Parque Progresso",
    phone: "(16) 3720-1001",
  },
  "rest-2": {
    neighborhood: "Centro",
    address: "Rua Major Claudiano, Centro",
    phone: "(16) 3720-1002",
  },
  "rest-3": {
    neighborhood: "Jardim Aeroporto",
    address: "Av. Hugo Betarello, Jardim Aeroporto",
    phone: "(16) 3720-1003",
  },
  "rest-4": {
    neighborhood: "Jardim Paulista",
    address: "Rua dos Pracinhas, Jardim Paulista",
    phone: "(16) 3720-1004",
  },
  "rest-5": {
    neighborhood: "Vila Aparecida",
    address: "Rua Voluntarios da Franca, Vila Aparecida",
    phone: "(16) 3720-1005",
  },
  "rest-6": {
    neighborhood: "Parque Progresso",
    address: "Rua Libero Badaro, Parque Progresso",
    phone: "(16) 3720-1006",
  },
  "rest-7": {
    neighborhood: "Jardim Lima",
    address: "Rua Frei Germano, Jardim Lima",
    phone: "(16) 3720-1007",
  },
  "rest-8": {
    neighborhood: "Residencial Sao Gabriel",
    address: "Rua Joao Batista de Paula, Residencial Sao Gabriel",
    phone: "(16) 3720-1008",
  },
};