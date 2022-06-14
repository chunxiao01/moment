const app = new Vue({
  el: "#app",
  data: {
    page: 1, //页数
    per_page: 20, //每页数量
    filter: "created", //筛选
    author: {
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
      post_imgs: null, //文章图片
      post_createtime: "", //文章发布时间
      post_updatetime: "", //文章修改时间
      post_comment: null, //文章评论
      post_like: null //文章点赞
    },
    postdata: [], //文章信息
    access_token: null //文章请求token
  },
  async mounted() {
    this.author_name = _config["owner"]
    let url = `https://api.github.com/repos/${_config["owner"]}/${_config["repo"]}/issues`
    url = url.trim()
    const postlist = await axios
      .get(url, {
        params: {
          page: this.page,
          per_page: this.per_page,
          filter: this.filter
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

    postlist.forEach((post) => {
      this.postdata.push({
        avatar_url: post.user.avatar_url,
        html_url: post.user.html_url,
        login: post.user.login,
        created_at: post.created_at,
        body: post.body
      })
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
    }
  }
})
