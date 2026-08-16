package vip.xiaonuo.zj.modular.favorite.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@TableName("ZJ_FAVORITE")
public class ZjFavorite {
    @TableId
    private String id;
    private String userId;
    private String listingId;
    private LocalDateTime createTime;
}
