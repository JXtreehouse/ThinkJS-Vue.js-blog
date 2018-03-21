module.exports = class extends think.Controller {
  async __before() {
    // 获取站点配置
    const site = await think.model('site').cache('site').find();
    this.assign('site', site);
    // 获取用户资料
    // TODO:如果要改为多用户系统，此处需要修改
    const user = await think.model('user').cache('user').find();
    this.assign('user', user);

    const recent = await this.getRecent();
    this.assign('recent', recent);
  }

  /**
   * 最近文章和回复
   * @return {[type]} [description]
   */
  async getRecent() {
    // 最近五篇文章
    const content = await think.model('content')
      .where({ status: 99, type: 'post' })
      .cache('recent_content')
      .limit(5).order('create_time desc')
      .fieldReverse('content,markdown')
      .select();
    // 最近五条回复
    const comment = await think.model('comment')
      .alias('comment')
      .join({
        table: 'content',
        join: 'left',
        as: 'content',
        on: ['content_id', 'id']
      })
      .join({
        table: 'meta',
        join: 'left',
        as: 'category',
        on: ['content.category_id', 'id']
      })
      .where({ 'comment.status': 99 })
      .cache('recent_comment')
      .field('comment.*,content.slug,content.category_id,category.slug as category')
      .limit(5)
      .order('comment.create_time desc')
      .select();
    return { content: content, comment: comment };
  }
};
