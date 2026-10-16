import { prisma } from './lib/prisma';

async function main() {
  console.log('🔄 Đang thử kết nối CSDL PostgreSQL...');

  // 1. Thử tạo 1 Người dùng mẫu (User)
  const newUser = await prisma.user.create({
    data: {
      email: 'demo@techbid.vn',
      name: 'Nguyen Van A',
      passwordHash: 'hashed_password_sample', // Sau này sẽ băm bằng bcrypt
    },
  });

  console.log('✅ Tạo User thành công:');
  console.log(newUser);

  // 2. Thử lấy danh sách tất cả User đang có trong CSDL
  const allUsers = await prisma.user.findMany();
  console.log(`📋 Tổng số User hiện có: ${allUsers.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi thao tác CSDL:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });