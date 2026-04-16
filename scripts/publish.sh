#!/bin/bash

# 设置私有仓库地址
REGISTRY="https://devwh.sinoccdc.com:8086/npm/"

echo "开始全量编译项目 (Web, Stdio, HTTP Server)..."
npm run build

if [ $? -eq 0 ]; then
    echo "编译成功，准备发布到仓库: $REGISTRY"
    
    # 执行发布
    # npm run release
    
    echo "发布脚本执行完毕。"
else
    echo "编译失败，请检查错误信息。"
    exit 1
fi
