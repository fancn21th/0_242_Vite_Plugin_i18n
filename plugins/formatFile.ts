import prettier from "prettier";
import fs from "fs";

// 读取 prettier 配置
const getConfig = async () => {
  const configFile = await prettier.resolveConfigFile();
  const config = await prettier.resolveConfig(configFile || "");
  return config;
};

export default function formatFile() {
  let prettierConfig: prettier.Options;

  return {
    name: "vite-plugin-format-file",
    enforce: "pre" as const,
    apply: "build" as const,
    async configResolved() {
      // 加载 prettier 配置
      prettierConfig = (await getConfig()) || {};
    },

    async transform(code: string, id: string) {
      if (id.includes("node_modules")) {
        return code;
      }

      // 只格式化 .js, .jsx, .ts, .tsx 文件
      if (/\.(js|jsx|ts|tsx)$/.test(id)) {
        try {
          // 使用 prettier 格式化代码
          const formatted = prettier.format(code, {
            ...prettierConfig,
            filepath: id, // 让 prettier 自动检测语言
          });

          console.log(`格式化 ${id} 文件成功`);

          // 覆盖原来的文件
          fs.writeFileSync(id, await formatted, "utf-8");

          return formatted;
        } catch (err) {
          console.error(`格式化 ${id} 文件失败:`, err);
        }
      }
      return code;
    },
  };
}
