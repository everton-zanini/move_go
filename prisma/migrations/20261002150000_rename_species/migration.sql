-- Dados: renomeia as linhas evolutivas (Ar = Gust, Terra = Roam). Idempotente.
UPDATE "PetSpecies" SET "name" = 'Gust' WHERE "name" = 'Movinho';
UPDATE "PetSpecies" SET "name" = 'Roam' WHERE "name" = 'Lobo';
