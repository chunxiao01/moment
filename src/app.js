const app = new Vue({
  el: "#app",
  data() {
    return {
      blog: {
        blog_title: ""
      },
      page: 1, //页数
      per_page: 20, //每页数量
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
      postdata: [], //文章信息
      access_token: null //文章请求token
    }
  },
  async mounted() {
    this.blog.blog_title = _config["blog_name"]
    document.title = this.blog.blog_title
    this.access_token = _config["access_token"]
    let url = `https://api.github.com/repos/${_config["owner"]}/${_config["repo"]}/issues`
    url = url.trim()
    const postlist = await axios
      .get(url, {
        params: {
          page: this.page,
          per_page: this.per_page,
          filter: this.filter,
          state: this.state
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
    console.log(postlist)
    if (Array.isArray(postlist) && postlist.length > 0) {
      this.author.author_id = postlist[0].user.id
      this.author.author_nickname =
        _config["nickname"] || postlist[0].user.login
      this.author.author_name = postlist[0].user.login
      this.author.author_url = postlist[0].user.html_url
      this.author.author_avatar_url = postlist[0].user.avatar_url
    }
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
    // postlist.forEach((post) => {
    //   const post_url = post.url
    //   const postdata = this.getpostlistdetail(post_url)
    //   console.log(postdata)
    // })
  },
  methods: {
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
    }
  }
})

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
