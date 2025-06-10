import fs from "fs";
import path from "path";

export default function avatarDirectoryPlugin() {
  const virtualModuleId = "virtual:avatars";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "avatar-directory",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const publicDir = path.resolve("public/avatars");

        const categories = fs
          .readdirSync(publicDir)
          .filter((file) =>
            fs.statSync(path.join(publicDir, file)).isDirectory()
          );

        const avatars = categories.reduce((acc, category) => {
          const categoryPath = path.join(publicDir, category);
          const files = fs
            .readdirSync(categoryPath)
            .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
            .map((file) => `/avatars/${category}/${file}`);

          acc[category] = files;
          return acc;
        }, {});

        return `export default ${JSON.stringify(avatars)}`;
      }
    },
  };
}
