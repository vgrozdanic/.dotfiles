# Django and DRF review guide

Read Python guide too.

## Authorization and request handling

- Scope every object query and mutation to authorized user, tenant, or policy. Authentication alone does not prevent IDOR.
- Check list, detail, bulk, export, download, and custom action paths. DRF object permissions do not automatically protect list querysets or create operations.
- Check HTTP method semantics, login requirements, CSRF protection for cookie-authenticated writes, redirect targets, and next URLs.
- Validate request size and external identifiers. Do not trust model forms or serializers to enforce authorization.
- Audit serializer fields, writable relationships, `fields = "__all__"`, mass assignment, owner fields, and read-only fields.

## ORM and transactions

- Trace template and serializer relationship access for N+1 queries. Match `select_related` to single-valued relations and `prefetch_related` to multi-valued relations.
- Check queryset evaluation and repeated `count`, `exists`, iteration, slicing, deferred field access, and per-row writes.
- Keep multi-row invariants in a transaction and storage constraints. Check concurrent create/update for races; application pre-checks are not enough.
- Use `transaction.on_commit` for external work that must happen only after commit. Make jobs and callbacks safe under retries.
- Check `bulk_create`, `bulk_update`, `update`, and `delete` for intentionally skipped `save`, validation, signals, timestamps, and cascades.
- Check cache keys for user or tenant isolation and invalidation.

## Migrations and deploys

- Check migrations against current data volume and database engine.
- Avoid one-step non-null additions or rewrites that lock large tables when staged migration is required.
- Check data migration batching, reversibility where needed, historical models, uniqueness conflicts, and time zone assumptions.
- Check rolling deploy compatibility between old code/new schema and new code/old schema.
- Ensure model constraint changes have matching migrations.

## Templates, files, and settings

- Audit `mark_safe`, `{% autoescape off %}`, custom template filters, and unquoted HTML attributes with untrusted data.
- Check file upload size, generated storage name, content validation, parser safety, access control, and serving headers. Extension and client MIME are not proof.
- Audit raw SQL, `extra`, `RawSQL`, cursor calls, subprocesses, archive extraction, and server-side URL fetches.
- Evaluate `DEBUG`, hosts, cookies, proxy SSL, CORS, HSTS, databases, and logging in actual deployment context. Do not demand one universal setting.
- Do not recommend file logging by default; container deployments commonly require stdout.

## Async and background work

- Check sync ORM and blocking libraries inside async views.
- Check async queryset evaluation, transactions, middleware adaptation, and thread-sensitive work.
- Check Celery or task queue arguments, retries, duplicate side effects, record deletion before execution, and transaction timing.

## Useful checks

Prefer focused Django tests such as `python manage.py test app.tests.TestCase.test_name`. Use query-count and authorization tests when they prove a suspected issue. Run `python manage.py check --deploy` only when deployment settings are available and relevant.
