-- Insert Flux dApp
INSERT INTO "dapp" ("id", "name", "website")
VALUES ('fl', 'Flux', 'https://flux.ilikeitstable.com')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "website" = EXCLUDED."website";
