-- AMS: data master awal (hanya daftar blok dan departemen; tidak ada data pribadi).
insert into public.blocks(name, sort) values ('Blok 09',9),('Blok 10',10),('Blok 11',11),('Blok 12',12),('Blok 13',13),('Blok 14',14),('Blok 15',15),('Blok 16',16),('Blok 17',17),('Blok 18',18),('Blok 19',19),('Blok 20',20),('Blok 21',21),('Blok 22',22),('Blok 23',23),('Blok 24',24),('Blok 25',25)
on conflict (name) do nothing;

insert into public.departments(name) values

('Business Control'),
('Environment & Business Improvement'),
('Exploration & Mine Development'),
('External Relations'),
('Finance & Accounting'),
('Government Relations & Compliance'),
('Grade Control'),
('Human Resources & General Affairs'),
('Information & Technology'),
('Logistic'),
('Management'),
('Mine Geology'),
('Mine Services & Construction'),
('MPE'),
('OHS & Training'),
('Outer Project'),
('Plant'),
('Preparetion & Laboratory'),
('Production'),
('Purchasing'),
('Quality Control'),
('Security'),
('Shipping'),
('Sustainable Product Development'),
('CSR & Land Acquisition')
on conflict (name) do nothing;
