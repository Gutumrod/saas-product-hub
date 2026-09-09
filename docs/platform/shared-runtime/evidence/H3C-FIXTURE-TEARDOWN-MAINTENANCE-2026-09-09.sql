begin;

alter table ps01.subscription_audit_log
  disable trigger trg_subscription_audit_immutable;

delete from ps01.subscription_audit_log
where shop_id in (
  '66d6340e-3f07-428e-af44-c2e42e4a943c'::uuid,
  '29f117d7-9cad-481d-9fef-df1bf9f6fe69'::uuid
);

alter table ps01.subscription_audit_log
  enable trigger trg_subscription_audit_immutable;

delete from ps01.shops
where id in (
  '66d6340e-3f07-428e-af44-c2e42e4a943c'::uuid,
  '29f117d7-9cad-481d-9fef-df1bf9f6fe69'::uuid
);

select jsonb_build_object(
  'shops', (select count(*) from ps01.shops where id in ('66d6340e-3f07-428e-af44-c2e42e4a943c'::uuid,'29f117d7-9cad-481d-9fef-df1bf9f6fe69'::uuid)),
  'audit', (select count(*) from ps01.subscription_audit_log where shop_id in ('66d6340e-3f07-428e-af44-c2e42e4a943c'::uuid,'29f117d7-9cad-481d-9fef-df1bf9f6fe69'::uuid)),
  'subscriptions', (select count(*) from ps01.shop_subscriptions where shop_id in ('66d6340e-3f07-428e-af44-c2e42e4a943c'::uuid,'29f117d7-9cad-481d-9fef-df1bf9f6fe69'::uuid)),
  'pets', (select count(*) from ps01.pets where id in ('060465dd-9c64-4906-b214-9491451fd33d'::uuid,'24fc6fb8-39ca-486a-a0a6-8784f66b6db5'::uuid)),
  'owners', (select count(*) from ps01.pet_owners where id in ('b16e05ad-de87-473e-bb7a-573bcab5cf35'::uuid,'a3b0d539-742a-4ab2-86a1-c2e05a817863'::uuid)),
  'rooms', (select count(*) from ps01.rooms where id='4ad0a21a-9907-44cc-8607-be44f9b20a6e'::uuid),
  'rate_plans', (select count(*) from ps01.room_rate_plans where id='6e59b9b1-ec2c-4a2b-9c91-90982efb0325'::uuid),
  'bookings', (select count(*) from ps01.bookings where shop_id in ('66d6340e-3f07-428e-af44-c2e42e4a943c'::uuid,'29f117d7-9cad-481d-9fef-df1bf9f6fe69'::uuid))
) as teardown_residue;

commit;
