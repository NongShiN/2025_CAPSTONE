CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "email" varchar UNIQUE,
  "username" varchar,
  "auth_provider" varchar,
  "password" varchar,
  "is_guest" boolean DEFAULT false,
  "created_at" timestamp
);

CREATE TABLE "chat_history" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "message" varchar(1000) NOT NULL,
  "response" varchar(1000) NOT NULL,
  "timestamp" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "posts" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "title" varchar NOT NULL,
  "content" text,
  "view_count" integer DEFAULT 0,
  "like_count" integer DEFAULT 0,
  "comment_count" integer DEFAULT 0,
  "created_at" timestamp
);

CREATE TABLE "comments" (
  "id" integer PRIMARY KEY,
  "post_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "content" varchar(1000),
  "created_at" timestamp
);

CREATE TABLE "tags" (
  "id" integer PRIMARY KEY,
  "name" varchar UNIQUE
);

CREATE TABLE "post_tags" (
  "post_id" integer NOT NULL,
  "tag_id" integer NOT NULL
);

COMMENT ON COLUMN "users"."email" IS 'Can be null for guest users';

COMMENT ON COLUMN "users"."auth_provider" IS 'google | apple | local | guest';

COMMENT ON COLUMN "users"."password" IS 'Only for local auth, null otherwise';

COMMENT ON COLUMN "posts"."user_id" IS 'Author info is hidden to viewers';

COMMENT ON COLUMN "posts"."content" IS 'Post body, can be from chat or custom';

ALTER TABLE "chat_history" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "post_tags" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "post_tags" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id");
