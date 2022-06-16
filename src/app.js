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
      state: "open", //文章状态open closed
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
      access_token: "", //文章请求token
      is_aside_menu_mode_show: false, //菜单设置详情按钮显示与隐藏
      isShowbacktop: false, //是否显示返回顶部按钮
      blogtheme: "light", //主题，默认浅色
      BS: null //滚动条对象
    }
  },
  async created() {
    let url = `https://api.github.com/repos/${_config["owner"]}/${_config["repo"]}/issues`
    url = url.trim()
    await axios
      .get(url, {
        params: {
          state: "open"
        }
      })
      .then((response) => {
        // 处理成功情况
        this.post_max_number = response.data.length
        return this.post_max_number
      })
      .catch(function (error) {
        // 处理错误情况
        console.log(error)
      })
  },
  async mounted() {
    this.blog.blog_title = _config["blog_name"]
    document.title = this.blog.blog_title
    this.access_token = _config["access_token"]
    this.per_page = _config["per_page"]
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

      postlist.forEach((post) => {
        if (post.author_association === "OWNER" && post.state === "open") {
          this.postdata.push({
            avatar_url: post.user.avatar_url,
            html_url: post.user.html_url,
            login: post.user.login,
            created_at: post.created_at,
            title: post.title,
            body: marked.parse(post.body || post.title || "无题"), //解析markdown
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
              body: marked.parse(post.body || post.title || "无题"), //解析markdown
              isshowpic: false
            })
          }
        })
        this.BS.refresh()
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
        pullUpLoad: true
        // scrollY: true,
        // scrollbar: true
      })
      // bs.on("refresh", () => {})
      this.BS = bs
      this.BS.on("scroll", (position) => {
        //滚动事件
        this.scrollPosition(position)
      })
      this.BS.on("pullingUp", () => {
        //上拉加载更多
        if (this.postdata.length < this.post_max_number) {
          this.getpostlist()
          this.BS.finishPullUp()
        }
        if (this.postdata.length === this.post_max_number) {
          this.BS.refresh()
        }
      })
    },
    //滚动内容实时监听位置
    scrollPosition(position) {
      const position_y = Math.abs(position.y)
      this.isShowbacktop = position_y > 1200
    },
    asideSetClick() {
      //设置
      this.is_aside_menu_mode_show = !this.is_aside_menu_mode_show
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

//axios配置
axios.defaults.headers.common[
  "Authorization"
] = `token ${_config["access_token"]}`

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
