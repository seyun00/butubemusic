





async function read_doc(client, dbname, colname) {
  const result = await client.db(dbname).collection(colname).find({}).toArray();
  // const result = await client.db(dbname).collection(colname).find({"price":{$gt:10000}}).toArray();
  // const result = await client.db(dbname).collection(colname).find({"Name":"사용자입력"}).toArray();
  // const result = await client.db(dbname).collection(colname).findOne({});  
  console.log(result);
  result.forEach(info => {
    console.table(info.music_id)
  });

};

async function read_music(client, dbname, colname, user_input, cmu_option) {
  console.log(`실행 ${colname}`);
  let music_list = [];

  if (cmu_option === '1') {
    const result = await client.db(dbname).collection(colname).find({}).toArray();
    result.forEach(info => {
      if (info.music_name.includes(user_input) || info.music_singer.includes(user_input)) {
        music_list.push({노래이름:info.music_name, 가수이름:info.music_singer})
      }
    });
    
    console.table(music_list);
  } else if (cmu_option === '2') {
    const result = await client.db(dbname).collection(colname).find({}).toArray();
    result.forEach(info => {
      if (info.music_theme.includes(user_input)) {
        music_list.push({노래이름:info.music_name, 가수이름:info.music_singer})
      }
    });
    console.table(music_list);
  };
}

// 장르 101번부터 50개씩 장르가 다른사람 플리로 생각하자 댄스, 발라드, 힙합, R&B, 록메탈, 트로트





//로그인 기능
async function login() {
  try {
    await client.connect();
    console.log("-------로그인-------")
    console.log("아이디를 입력해주세요.")
    let userID = await Input.uInput();

    let qry01 = { user_id: userID }
    const result01 = await client.db("butube").collection("USER").findOne(qry01);
    if (result01 === null) {
      console.log("존재하지 않는 아이디입니다.")
      process.exit();
    } else {
      let password = result01.user_pw
      console.log("비밀번호를 입력해주세요.")
      let userPW = await Input.uInput();
      if (password !== userPW) {
        console.log("잘못된 비밀번호입니다.");
      } else {
        console.log("로그인이 완료되었습니다.")
      }
    }
  } catch (e) {
    console.log(e.message);
  } finally {
    await client.close();
    process.exit();
  }
}
// login();




// top100 기능

async function read_top100() {
  try {
    await client.connect();
    const result = await client.db("butube").collection("MUSIC").find({ music_rank: { $exists: true } }).toArray();
    const formattedResults = result.map(item => {
      return {
        '순위': item.music_rank,
        '곡명': item.music_name,
        '가수': item.music_singer,
        '테마': item.music_theme
      };
    });

    // 수정된 결과를 테이블로 출력합니다.
    console.table(formattedResults);

    // 사용자에게 곡명을 입력받습니다.
    console.log('재생을 원하시는 곡명을 입력해주세요: ');
    const songName = await uInput(); // 사용자로부터 입력을 받는다
    const song = result.find(item => item.music_name === songName);


    if (song) {
      const line = '-'.repeat(30);
      console.log(line);
      console.log(`(재생중) ${song.music_name} - ${song.music_singer}`);
      console.log(line);

      // 현재 곡 정보 저장
      let currentSong = song;

      // 메뉴 출력 및 선택 처리
      function showMenu() {
        console.log('1. 셔플 2. 뒤로가기 3. 앞으로가기 4. 댓글추가');
      }

      async function handleMenu() {
        const input = await uInput();
        switch (input) {
          case '1':
            // 셔플 기능 구현
            break;

          case '2':
            if (!currentSong) {
              console.log('현재 재생 중인 곡이 없습니다.');
              break;
            }



            const prevSong = await client.db("butube").collection("MUSIC").findOne({ _id: { $lt: currentSong._id } }, { sort: { _id: -1 } });
            if (!prevSong) {
              console.log('첫 번째 곡입니다.');
              break;
            }

            // 현재 곡 정보 업데이트
            currentSong = prevSong;

            // 이전 곡 정보 출력
            console.log(line);
            console.log(`(재생중) ${prevSong.music_name} - ${prevSong.music_singer}`);
            console.log(line);

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
            break;

          case '3':
            if (!currentSong) {
              console.log('현재 재생 중인 곡이 없습니다.');
              break;
            }

            const nextSong = await client.db("butube").collection("MUSIC").findOne({ _id: { $gt: currentSong._id } });
            if (!nextSong) {
              console.log('마지막 곡입니다.');
              break;
            }

            // 현재 곡 정보 업데이트
            currentSong = nextSong;

            // 다음 곡 정보 출력
            console.log(line);
            console.log(`(재생중) ${nextSong.music_name} - ${nextSong.music_singer}`);
            console.log(line);

            // 메뉴 출력 및 선택 처리
            showMenu();
            await handleMenu();
            break;
          case '4':
            // 댓글추가 기능 구현
            break;
          default:
            console.log("잘못된 입력입니다.")
            process.exit()
        }
      }

      showMenu();
      await handleMenu();

    } else {
      console.log('해당 곡을 찾을 수 없습니다. 곡명을 정확히 입력해주세요.');
    }

  } catch (e) {
    console.log(e.message);
  } finally {
    await client.close();
  }
}


module.exports = { read_doc, login, read_music, read_top100 };
