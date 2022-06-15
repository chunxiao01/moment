const app = new Vue({
  el: "#app",
  data() {
    return {
      blog: {
        blog_title: ""
      },
      page: 1, //页数
      per_page: 0, //每页数量
      filter: "created", //筛选
      state: "open", //文章状态open close
      author: {
        author_id: "", //用户ID
        author_nickname: "", //用户昵称
        author_name: "", //作者
        author_avatar_url: "", //作者头像
        author_url: "", //作者gihtub链接
        author_repo: "" //作者gihtub仓库
      },
      post: {
        post_id: "", //文章id
        post_url: "", //文章链接
        post_title: "", //文章标题
        post_content: "", //文章内容
        isshowpic: false, //是否显示文章图片
        post_imgs: null, //文章图片
        post_createtime: "", //文章发布时间
        post_updatetime: "", //文章修改时间
        post_comment: null, //文章评论
        post_like: null //文章点赞
      },
      post_max_number: 0, //文章的数量
      postdata: [], //文章信息
      access_token: null, //文章请求token
      aside_menu_mode_type: false, //菜单设置详情按钮显示与隐藏
      isShowbacktop: false, //是否显示返回顶部按钮
      blogtheme: "light", //主题，默认浅色
      BS: null //滚动条对象
    }
  },
  async mounted() {
    this.blog.blog_title = _config["blog_name"]
    document.title = this.blog.blog_title
    this.access_token = _config["access_token"]
    this.per_page = _config["per_page"]
    // document.querySelector('#container').

    let url = `https://api.github.com/repos/${_config["owner"]}/${_config["repo"]}/issues`
    url = url.trim()
    const page = this.page
    const per_page = this.per_page
    const filter = this.filter
    const state = this.state
    const postlist = await axios
      .get(url, {
        params: {
          page,
          per_page,
          filter,
          state
        }
      })
      .then(function (response) {
        // 处理成功情况
        return response.data
      })
      .catch(function (error) {
        // 处理错误情况
        console.log(error)
      })
    if (Array.isArray(postlist) && postlist.length > 0) {
      this.author.author_id = postlist[0].user.id
      this.author.author_nickname =
        _config["nickname"] || postlist[0].user.login
      this.author.author_name = postlist[0].user.login
      this.author.author_url = postlist[0].user.html_url
      this.author.author_avatar_url = postlist[0].user.avatar_url
      this.post_max_number = postlist[0].number
      postlist.forEach((post) => {
        if (post.author_association === "OWNER" && post.state === "open") {
          this.postdata.push({
            avatar_url: post.user.avatar_url,
            html_url: post.user.html_url,
            login: post.user.login,
            created_at: post.created_at,
            title: post.title,
            body: marked.parse(post.body), //解析markdown
            isshowpic: false
          })
        }
      })
    }

    this.getscroll() //滚动条
    this.$nextTick(() => {
      this.BS.refresh()
    })
  },
  computed: {
    aside_menu_mode_class() {
      return this.aside_menu_mode_type
        ? "aside_menu_mode_show"
        : "aside_menu_mode_hide"
    }
  },
  methods: {
    async getpostlist() {
      //上拉加载事件
      let url = `https://api.github.com/repos/${_config["owner"]}/${_config["repo"]}/issues`
      url = url.trim()
      const page = parseInt(this.page) + 1
      const per_page = this.per_page
      const filter = this.filter
      const state = this.state
      const postlist = await axios
        .get(url, {
          params: {
            page,
            per_page,
            filter,
            state
          }
        })
        .then(function (response) {
          // 处理成功情况
          return response.data
        })
        .catch(function (error) {
          // 处理错误情况
          console.log(error)
        })

      if (Array.isArray(postlist) && postlist.length > 0) {
        postlist.forEach((post) => {
          if (post.author_association === "OWNER" && post.state === "open") {
            this.postdata.push({
              avatar_url: post.user.avatar_url,
              html_url: post.user.html_url,
              login: post.user.login,
              created_at: post.created_at,
              title: post.title,
              body: marked.parse(post.body), //解析markdown
              isshowpic: false
            })
          }
        })
        this.page = parseInt(this.page) + 1
      }
    },
    async getpostlistdetail(post_url) {
      let result = null
      await axios
        .get(post_url)
        .then(function (response) {
          // 处理成功情况
          return response.data
        })
        .catch(function (error) {
          // 处理错误情况
          console.log(error)
        })
    },
    daterealformat(date) {
      dayjs.locale("zh-cn") //日期本地化
      return dayjs(date).format("YYYY-MM-DD HH:mm:ss")
    },
    dateformat(date) {
      dayjs.locale("zh-cn") //日期本地化
      const nowdate = dayjs()
      const diff_hour = nowdate.diff(date, "hour")
      const diff_minute = nowdate.diff(date, "minute")
      const diff_seconds = nowdate.diff(date, "second")
      if (diff_seconds < 60) {
        return "刚刚"
      } else if (diff_minute < 60) {
        return diff_minute + "分钟前"
      } else {
        return dayjs(date).format("YYYY-MM-DD HH:mm:ss")
      }
    },
    getposttext() {
      console.log()
    },
    getscroll() {
      //初始化滚动条better-scroll
      // let bs = new BScroll("#container", {
      //   probeType: 3,
      //   pullUpLoad: true
      // })
      let bs = BetterScroll.createBScroll("#container", {
        probeType: 3,
        pullUpLoad: true,
        scrollY: true,
        scrollbar: true
      })
      // bs.on("refresh", () => {})
      this.BS = bs
      this.BS.on("scroll", (position) => {
        //滚动事件
        this.scrollPosition(position)
      })
      this.BS.on("pullingUp", () => {
        //上拉加载更多
        if ((this.page + 1) * this.per_page <= this.post_max_number) {
          this.getpostlist()
          this.BS.finishPullUp()
          this.BS.refresh()
        }
      })
    },
    //滚动内容实时监听位置
    scrollPosition(position) {
      const position_y = Math.abs(position.y)
      this.isShowbacktop = position_y > 1500
    },
    asideSetClick() {
      //设置
      this.aside_menu_mode_type = !this.aside_menu_mode_type
    },
    toTopClick() {
      //滚动条回到顶部
      this.BS.scrollTo(0, 0, 1000)
    },
    switchColorModeClick() {
      //切换深色和浅色模式
      console.log(this.blogtheme)
    }
  }
})

//markdjs markdown转html设置
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  xhtml: true,
  highlight: function (code) {
    return highlight.highlightAuto(code).value
  }
})
