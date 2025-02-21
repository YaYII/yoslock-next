# YosLock Next - 随行人管理系统

## 项目信息
- 任务编号：TASK-2025-00009
- 执行人：雄、海华
- 需求：思佳
- 测试：思佳

## 功能概述

### 1. 资料录入
#### 1.1 添加随行人（真人登记）
- **操作流程**
  1. 选择证件类型
     - 支持大陆身份证、港澳通行证、护照等
  2. 扫描证件
     - 调用 AI OCR 技术自动识别证件信息
     - 自动提取姓名、证件号码等信息
  3. 真人验证
     - 调用摄像头进行人脸识别
     - 确保证件持有人与当前用户一致
  4. 信息确认
     - 显示识别结果
     - 支持补充联系方式等可选信息
  5. 提交审核
     - 支持自动审核和人工审核两种方式
     - 审核状态：真人验证通过、真人验证中、未真人验证

#### 1.2 搜索添加（好友请求）
- **功能特点**
  - 通过邮箱账号添加已注册用户
  - 支持好友验证机制
  - 好友状态管理（待验证、已通过、已拒绝）
  - 已验证好友可直接添加为随行人

### 2. 随行人管理
#### 2.1 随行人列表
- **显示信息**
  - 姓名
  - 证件类型
  - 证件号码（脱敏显示，仅显示最后 3 位）
  - 验证状态
  - 添加时间

#### 2.2 状态管理
- **随行人状态**
  - 已通过：完成验证的随行人
  - 审核中：需要人工审核的记录
  - 已拒绝：被拒绝的记录

- **请求状态**
  - 等待验证：新发送的好友请求
  - 已通过：已接受的请求
  - 已拒绝：已拒绝的请求
  - 已过期：超时未处理的请求

#### 2.3 编辑功能
- 支持重新上传证件
- 支持修改联系方式等可选信息
- 支持请求人工核验

#### 2.4 删除功能
- 支持删除随行人记录
- 删除前需二次确认

### 3. 人工核验
#### 3.1 申请核验
- 用户可在以下场景申请人工核验：
  - OCR 识别结果不准确
  - 真人验证失败
  - 自动审核未通过

#### 3.2 核验流程
1. 用户提交核验申请
2. 后台管理员审核
3. 系统通过 ERP notification 推送核验结果
4. 核验通过则更新状态，未通过则提示重新验证

## 技术实现

### 1. 核心组件
- `CompanionList`: 随行人列表管理
- `AddCompanion`: 真人登记流程
- `SearchCompanionModal`: 搜索添加功能
- `NewFriends`: 好友请求管理

### 2. 关键功能
- AI OCR 证件识别
- 人脸识别验证
- 实时状态管理
- 消息通知系统

### 3. 数据安全
- 证件信息脱敏显示
- 数据传输加密
- 权限访问控制

## 测试规范

### 1. 功能测试
- 添加随行人测试
- 编辑信息测试
- 删除操作测试
- 好友请求测试
- 人工核验测试

### 2. 异常处理
- 网络异常处理
- 识别失败处理
- 验证超时处理
- 并发请求处理

## 部署要求

### 1. 环境依赖
- Node.js >= 14.0.0
- npm >= 6.0.0
- Next.js >= 13.0.0

### 2. 安装步骤
```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境构建
npm run build

# 启动生产服务
npm run start
```

## 后续优化计划
1. 优化 OCR 识别准确率
2. 提升人脸识别速度
3. 增加批量导入功能
4. 优化移动端适配
5. 添加数据分析功能
6. 完善权限管理系统
